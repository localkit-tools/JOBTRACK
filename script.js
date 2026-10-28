
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

  if (responseElement) {
    responseElement.textContent = responseRate + "%";
  }
}

function updateSuccessInsights() {
  const applications = getApplications();
  const total = applications.length;

  const interviewCount = applications.filter(
    app => app.status === "Interview"
  ).length;

  const offerCount = applications.filter(
    app => app.status === "Offer"
  ).length;

  const rejectionCount = applications.filter(
    app => app.status === "Rejected"
  ).length;

  const interviewRate = total === 0
    ? 0
    : Math.round((interviewCount / total) * 100);

  const offerRate = total === 0
    ? 0
    : Math.round((offerCount / total) * 100);

  const rejectionRate = total === 0
    ? 0
    : Math.round((rejectionCount / total) * 100);

  const interviewRateElement =
    document.getElementById("analyticsInterviewRate");
  const offerRateElement =
    document.getElementById("analyticsOfferRate");
  const rejectionRateElement =
    document.getElementById("analyticsRejectionRate");

  const interviewBar =
    document.getElementById("analyticsInterviewBar");
  const offerBar =
    document.getElementById("analyticsOfferBar");
  const rejectionBar =
    document.getElementById("analyticsRejectionBar");

  if (interviewRateElement) {
    interviewRateElement.textContent = interviewRate + "%";
  }

  if (offerRateElement) {
    offerRateElement.textContent = offerRate + "%";
  }

  if (rejectionRateElement) {
    rejectionRateElement.textContent = rejectionRate + "%";
  }

  if (interviewBar) {
    interviewBar.style.width = interviewRate + "%";
  }

  if (offerBar) {
    offerBar.style.width = offerRate + "%";
  }

  if (rejectionBar) {
    rejectionBar.style.width = rejectionRate + "%";
  }
}

function updatePipeline() {


function updatePipeline() {
  const applications = getApplications();
  const total = applications.length;

  const statuses = [
    { status: "Applied", countId: "pipelineApplied", barId: "barApplied" },
    { status: "Interview", countId: "pipelineInterview", barId: "barInterview" },
    { status: "Offer", countId: "pipelineOffer", barId: "barOffer" },
    { status: "Rejected", countId: "pipelineRejected", barId: "barRejected" }
  ];

  statuses.forEach(function (item) {
    const count = applications.filter(function (app) {
      return app.status === item.status;
    }).length;

    const countElement = document.getElementById(item.countId);
    const barElement = document.getElementById(item.barId);

    const percentage = total === 0
      ? 0
      : Math.round((count / total) * 100);

    if (countElement) {
      countElement.textContent = count;
    }

    if (barElement) {
      barElement.style.width = percentage + "%";
    }
  });
}


function updateActivityChart() {
  const applications = getApplications();
  const today = new Date();

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const counts = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setHours(0, 0, 0, 0);
    date.setDate(today.getDate() - i);

    const dateKey =
      date.getFullYear() + "-" +
      String(date.getMonth() + 1).padStart(2, "0") + "-" +
      String(date.getDate()).padStart(2, "0");
    
    const count = applications.filter(function (app) {
  const savedDate = String(app.applicationDate || "").slice(0, 10);
  return savedDate === dateKey;
}).length;

    counts.push({
      label: dayNames[date.getDay()],
      count: count
    });
  }

  const maxCount = Math.max(1, ...counts.map(function (item) {
    return item.count;
  }));

  counts.forEach(function (item, index) {
    const bar = document.getElementById("activityBar" + index);
    const label = document.getElementById("activityLabel" + index);
    const countLabel = document.getElementById("activityCount" + index);
if (countLabel) countLabel.textContent = item.count;

   const height = item.count === 0
  ? 0
  : Math.max(8, Math.round((item.count / maxCount) * 100));
    if (bar) {
      bar.style.height = height + "%";
      bar.title = item.count + " application(s)";
      bar.classList.toggle(
        "current",
        index === 6
      );
    }

    if (label) {
      label.textContent = item.label;
    }
  });
}


function renderApplications() {
  const applications = getApplications();
  updateStatistics();
    updateSuccessInsights();
  updatePipeline();
updateActivityChart();
    updateFollowUpReminders();
  
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
    let priority = "Low";

    if (app.followUpDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const followUp = new Date(app.followUpDate + "T00:00:00");
      const daysAway = Math.round(
        (followUp - today) / (1000 * 60 * 60 * 24)
      );

      if (app.status !== "Offer" && app.status !== "Rejected") {
        if (daysAway <= 0) {
          priority = "High";
        } else if (daysAway <= 3) {
          priority = "Medium";
        }
      }
    }
    return `
      <tr>
        <td>
          <div class="company">${escapeHTML(app.company)}</div>
          <div class="job-title">${escapeHTML(app.jobTitle)}</div>
        </td>
        <td>${escapeHTML(app.applicationDate || "")}</td>

        <td>
          <select
            aria-label="Update status for ${escapeHTML(app.company)}"
            onchange="updateApplicationStatus('${escapeHTML(app.id)}', this.value)"
          >
            <option value="Applied" ${app.status === "Applied" ? "selected" : ""}>Applied</option>
            <option value="Interview" ${app.status === "Interview" ? "selected" : ""}>Interview</option>
            <option value="Offer" ${app.status === "Offer" ? "selected" : ""}>Offer</option>
            <option value="Rejected" ${app.status === "Rejected" ? "selected" : ""}>Rejected</option>
          </select>

          <div style="margin-top: 8px; display: flex; gap: 6px;">
            <button type="button" onclick="editApplication('${escapeHTML(app.id)}')">
              Edit
            </button>
            <button type="button" onclick="deleteApplication('${escapeHTML(app.id)}')">
              Delete
            </button>
          </div>
        </td>

       
        <td>
          <span class="status">${priority}</span>
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
    followUpDate: String(formData.get("followUpDate") || ""),
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
      const existingKeys = new Set(
  existing.map(app =>
    [
      app.jobTitle,
      app.company,
      app.applicationDate,
      app.status
    ].map(value => String(value || "").trim().toLowerCase()).join("|")
  )
);

      for (const line of nonEmptyLines.slice(1)) {
        const values = parseCSVLine(line);
        const row = {};

        headers.forEach((header, index) => {
          row[header] = values[index] ?? "";
        });

        if (!row["job title"].trim() || !row["company"].trim()) {
          continue;
        }
const duplicateKey = [
  row["job title"],
  row["company"],
  row["application date"],
  row["status"] || "Applied"
].map(value => String(value || "").trim().toLowerCase()).join("|");

if (existingKeys.has(duplicateKey)) {
  continue;
}

existingKeys.add(duplicateKey);
        
        imported.push({
          id: (Date.now() + imported.length).toString(),
          jobTitle: row["job title"].trim(),
          company: row["company"].trim(),
          applicationDate: row["application date"].trim(),
          followUpDate: (row["follow-up date"] || "").trim(),
          status: row["status"].trim() || "Applied",
          jobLink: row["job link"].trim(),
          notes: row["notes"].trim()
        });
      }

     if (imported.length === 0) {
  alert("No new applications to import. These applications may already exist in JobTrack.");
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
  jobForm.elements.followUpDate.value = app.followUpDate || "";
  jobForm.elements.status.value = app.status;
  jobForm.elements.jobLink.value = app.jobLink;
  jobForm.elements.notes.value = app.notes;

  jobForm.dataset.editingId = id;
  jobForm.scrollIntoView({ behavior: "smooth", block: "start" });
}

// Quickly update an application's status
function updateApplicationStatus(id, newStatus) {
  const allowedStatuses = ["Applied", "Interview", "Offer", "Rejected"];

  if (!allowedStatuses.includes(newStatus)) {
    alert("Invalid application status.");
    renderApplications();
    return;
  }

  const applications = getApplications();
  const app = applications.find(item => item.id === id);

  if (!app) {
    alert("Application not found.");
    renderApplications();
    return;
  }

  app.status = newStatus;

  if (saveApplications(applications)) {
    renderApplications();
  } else {
    renderApplications();
    alert("Status could not be saved. Please try again.");
  }
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
    "Follow-up Date",
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
    app.followUpDate || "",
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


function updateFollowUpReminders() {
  const applications = getApplications();
  const reminderList = document.getElementById("followUpList");
  const reminderCount = document.getElementById("followUpCount");
    const overdueCount = document.getElementById("overdueReminderCount");
  const upcomingCount = document.getElementById("upcomingReminderCount");

  if (!reminderList || !reminderCount) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const reminders = applications
    .filter(app =>
      app.followUpDate &&
      app.status !== "Offer" &&
      app.status !== "Rejected"
    )
    .map(app => {
      const date = new Date(app.followUpDate + "T00:00:00");
      const daysAway = Math.round(
        (date - today) / (1000 * 60 * 60 * 24)
      );

      return { ...app, daysAway };
    })
    .sort((a, b) => a.daysAway - b.daysAway);

  reminderCount.textContent =
    reminders.length + (reminders.length === 1 ? " reminder" : " reminders");
  const overdue = reminders.filter(app => app.daysAway < 0).length;
  const upcoming = reminders.filter(app => app.daysAway >= 0).length;

  if (overdueCount) overdueCount.textContent = overdue;
  if (upcomingCount) upcomingCount.textContent = upcoming;
  

  if (reminders.length === 0) {
    reminderList.innerHTML =
      '<p class="subtitle">No follow-up reminders yet. Add a follow-up date when saving an application.</p>';
    return;
  }

 
  reminderList.innerHTML = reminders.map(app => {
    let message;

    if (app.daysAway < 0) {
      message = "Overdue by " + Math.abs(app.daysAway) + " day(s)";
    } else if (app.daysAway === 0) {
      message = "Due today";
    } else {
      message = "Due in " + app.daysAway + " day(s)";
    }

    return `
      <div style="padding: 12px 0; border-bottom: 1px solid var(--border, #eee);">
        <strong>${escapeHTML(app.company)}</strong>
        <div class="subtitle">${escapeHTML(app.jobTitle)}</div>
        <div style="margin-top: 6px; font-size: 13px;">
          ${escapeHTML(app.followUpDate)} · ${escapeHTML(message)}
        </div>
        <button
          type="button"
          style="margin-top: 10px;"
          onclick="editApplication('${escapeHTML(app.id)}')">
          Edit Reminder
        </button>
      </div>`;
  }).join("");
}
// Initialize the dashboard when the page loads
renderApplications();
