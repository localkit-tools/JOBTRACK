
"use strict";

// JobTrack - Application Tracker
const addJobButton = document.getElementById("addJobButton");
const jobFormPanel = document.getElementById("jobFormPanel");
const closeJobForm = document.getElementById("closeJobForm");
const jobForm = document.getElementById("jobForm");
const applicationRows = document.getElementById("applicationRows");
const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");

const STORAGE_KEY = "jobtrack_applications";

function getApplications() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch (error) {
    console.error("Could not read applications:", error);
    return [];
  }
}

function saveApplications(applications) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(applications));
    return true;
  } catch (error) {
    alert("Could not save applications in this browser.");
    return false;
  }
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, function (char) {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[char];
  });
}

function renderApplications() {
  const applications = getApplications();
  const searchTerm = (searchInput?.value || "").toLowerCase().trim();
  const selectedStatus = statusFilter?.value || "all";

  const filtered = applications.filter(function (app) {
    const matchesSearch =
      (app.jobTitle || "").toLowerCase().includes(searchTerm) ||
      (app.company || "").toLowerCase().includes(searchTerm);

    const matchesStatus =
      selectedStatus === "all" || app.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  if (!applicationRows) return;

  if (filtered.length === 0) {
    applicationRows.innerHTML = `
      <tr>
        <td colspan="3" style="text-align:center; padding:24px;">
          No saved applications found.
        </td>
      </tr>`;
    return;
  }

  applicationRows.innerHTML = filtered.map(function (app) {
    const statusClass = (app.status || "").toLowerCase();

    return `
      <tr>
        <td>
          <div class="company">${escapeHTML(app.company)}</div>
          <div class="job-title">${escapeHTML(app.jobTitle)}</div>
        </td>
        <td>${escapeHTML(app.applicationDate || "")}</td>
        <td>
          <span class="status ${escapeHTML(statusClass)}">
            ${escapeHTML(app.status || "Applied")}
          </span>
        </td>
      </tr>`;
  }).join("");
}

// Open and close the form
addJobButton?.addEventListener("click", function () {
  jobFormPanel.hidden = false;
  jobFormPanel.scrollIntoView({ behavior: "smooth", block: "start" });
});

closeJobForm?.addEventListener("click", function () {
  jobFormPanel.hidden = true;
});

// Set today's date
function setTodayDate() {
  const dateInput = jobForm?.elements.applicationDate;
  if (!dateInput) return;

  const today = new Date();
  dateInput.value = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0")
  ].join("-");
}

setTodayDate();

// Save a new application
jobForm?.addEventListener("submit", function (event) {
  event.preventDefault();

  const formData = new FormData(jobForm);

  const application = {
    id: Date.now().toString(),
    jobTitle: String(formData.get("jobTitle") || "").trim(),
    company: String(formData.get("company") || "").trim(),
    applicationDate: String(formData.get("applicationDate") || ""),
    status: String(formData.get("status") || "Applied"),
    jobLink: String(formData.get("jobLink") || "").trim(),
    notes: String(formData.get("notes") || "").trim()
  };

  const applications = getApplications();
  applications.unshift(application);

  if (!saveApplications(applications)) return;

  renderApplications();
  alert("Application saved successfully!");

  jobForm.reset();
  setTodayDate();
  jobFormPanel.hidden = true;
});

// Search and filter
searchInput?.addEventListener("input", renderApplications);
statusFilter?.addEventListener("change", renderApplications);

// Show saved applications when the page opens
renderApplications();
