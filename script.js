
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

function updateStatistics() {
  const applications = getApplications();

  const total = applications.length;
  const interviews = applications.filter(
    app => app.status === "Interview"
  ).length;
  const offers = applications.filter(
    app => app.status === "Offer"
  ).length;
  const responses = applications.filter(
    app => ["Interview", "Offer", "Rejected"].includes(app.status)
  ).length;

  const totalElement = document.getElementById("totalCount");
  const interviewElement = document.getElementById("interviewCount");
  const offerElement = document.getElementById("offerCount");
  const responseElement = document.getElementById("responseRate");

  if (totalElement) totalElement.textContent = total;
  if (interviewElement) interviewElement.textContent = interviews;
  if (offerElement) offerElement.textContent = offers;

  const responseRate = total === 0
    ? 0
    : Math.round((responses / total) * 100);

  if (responseElement) {
    responseElement.textContent = responseRate + "%";
  }
}

function renderApplications() {
  const applications = getApplications();
  updateStatistics();
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
          <div style="margin-top: 8px; display: flex; gap: 6px;">
            <button type="button" onclick="editApplication('${escapeHTML(app.id)}')">
              Edit
            </button>
            <button type="button" onclick="deleteApplication('${escapeHTML(app.id)}')">
              Delete
            </button>
          </div>
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
  const editingId = jobForm.dataset.editingId;

  if (editingId) {
    const index = applications.findIndex(
      item => item.id === editingId
    );

    if (index !== -1) {
      applications[index] = {
        ...applications[index],
        ...application,
        id: editingId
      };
    }
  } else {
    applications.unshift(application);
  }

  if (!saveApplications(applications)) return;

  delete jobForm.dataset.editingId;

  renderApplications();
  alert("Application saved successfully!");

  jobForm.reset();
  setTodayDate();
  jobFormPanel.hidden = true;
});

// Search and filter
searchInput?.addEventListener("input", renderApplications);
statusFilter?.addEventListener("change", renderApplications);

// Export applications
document.getElementById("exportButton")
  ?.addEventListener("click", exportApplicationsCSV);

// Import applications from CSV
document.getElementById("importButton")
  ?.addEventListener("click", function () {
    document.getElementById("importFile")?.click();
  });

document.getElementById("importFile")
  ?.addEventListener("change", async function (event) {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/);

      function parseCSVLine(line) {
        const values = [];
        let value = "";
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
          const char = line[i];

          if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
              value += '"';
              i++;
            } else {
              inQuotes = !inQuotes;
            }
          } else if (char === "," && !inQuotes) {
            values.push(value);
            value = "";
          } else {
            value += char;
          }
        }

        values.push(value);
        return values;
      }

      const nonEmptyLines = lines.filter(line => line.trim() !== "");
      if (nonEmptyLines.length < 2) {
        alert("The CSV file contains no application rows.");
        return;
      }

      const headers = parseCSVLine(nonEmptyLines[0])
        .map(header => header.trim().toLowerCase());

      const requiredHeaders = [
        "job title",
        "company",
        "application date",
        "status",
        "job link",
        "notes"
      ];

      if (!requiredHeaders.every(header => headers.includes(header))) {
        alert("This CSV does not have the expected JobTrack columns.");
        return;
      }

      const existing = getApplications();
      const imported = [];

      for (const line of nonEmptyLines.slice(1)) {
        const values = parseCSVLine(line);
        const row = {};

        headers.forEach((header, index) => {
          row[header] = values[index] ?? "";
        });

        if (!row["job title"].trim() || !row["company"].trim()) {
          continue;
        }

        imported.push({
          id: (Date.now() + imported.length).toString(),
          jobTitle: row["job title"].trim(),
          company: row["company"].trim(),
          applicationDate: row["application date"].trim(),
          status: row["status"].trim() || "Applied",
          jobLink: row["job link"].trim(),
          notes: row["notes"].trim()
        });
      }

      if (imported.length === 0) {
        alert("No valid applications were found in this CSV.");
        return;
      }

      if (!confirm(
        `Import ${imported.length} applications? Existing applications will be kept.`
      )) {
        return;
      }

      if (saveApplications([...existing, ...imported])) {
        renderApplications();
        alert(`${imported.length} applications imported successfully.`);
      }
    } catch (error) {
      console.error("CSV import failed:", error);
      alert("Could not read this CSV file.");
    } finally {
      event.target.value = "";
    }
  });

// Show saved applications when the page opens
renderApplications();
// Edit an existing application
function editApplication(id) {
  const applications = getApplications();
  const app = applications.find(item => item.id === id);

  if (!app) {
    alert("Application not found.");
    return;
  }

  jobFormPanel.hidden = false;

  jobForm.elements.jobTitle.value = app.jobTitle;
  jobForm.elements.company.value = app.company;
  jobForm.elements.applicationDate.value = app.applicationDate;
  jobForm.elements.status.value = app.status;
  jobForm.elements.jobLink.value = app.jobLink;
  jobForm.elements.notes.value = app.notes;

  jobForm.dataset.editingId = id;
  jobForm.scrollIntoView({ behavior: "smooth", block: "start" });
}

// Delete an application
function deleteApplication(id) {
  if (!confirm("Are you sure you want to delete this application?")) {
    return;
  }

  const applications = getApplications();
  const updatedApplications = applications.filter(
    item => item.id !== id
  );

  if (saveApplications(updatedApplications)) {
    renderApplications();
    alert("Application deleted successfully.");
  }
}

// Export saved applications to CSV
function exportApplicationsCSV() {
  const applications = getApplications();

  if (applications.length === 0) {
    alert("There are no applications to export.");
    return;
  }

  const headers = [
    "Job Title",
    "Company",
    "Application Date",
    "Status",
    "Job Link",
    "Notes"
  ];

  function escapeCSV(value) {
    let text = String(value ?? "");

    // Prevent spreadsheet formula injection
    if (/^[\s]*[=+\-@]/.test(text)) {
      text = "'" + text;
    }

    return '"' + text.replace(/"/g, '""') + '"';
  }

  const rows = applications.map(app => [
    app.jobTitle,
    app.company,
    app.applicationDate,
    app.status,
    app.jobLink,
    app.notes
  ]);

  const csvContent = [headers, ...rows]
    .map(row => row.map(escapeCSV).join(","))
    .join("\r\n");

  const blob = new Blob(
    ["\uFEFF" + csvContent],
    { type: "text/csv;charset=utf-8;" }
  );

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "jobtrack-applications.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}

