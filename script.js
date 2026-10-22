
"use strict";

// JobTrack - Application form and local storage

const addJobButton = document.getElementById("addJobButton");
const jobFormPanel = document.getElementById("jobFormPanel");
const closeJobForm = document.getElementById("closeJobForm");
const jobForm = document.getElementById("jobForm");

const STORAGE_KEY = "jobtrack_applications";

function getApplications() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error("Could not read applications:", error);
    return [];
  }
}

function saveApplications(applications) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(applications)
    );
    return true;
  } catch (error) {
    alert("Could not save. Please check browser storage.");
    return false;
  }
}

// Open the form
addJobButton.addEventListener("click", function () {
  jobFormPanel.hidden = false;
  jobFormPanel.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
});

// Close the form
closeJobForm.addEventListener("click", function () {
  jobFormPanel.hidden = true;
});

// Set today's date
const dateInput = jobForm.elements.applicationDate;

function setTodayDate() {
  const today = new Date();
  dateInput.value = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0")
  ].join("-");
}

setTodayDate();

// Save an application
jobForm.addEventListener("submit", function (event) {
  event.preventDefault();

  const formData = new FormData(jobForm);

  const application = {
    id: Date.now().toString(),
    jobTitle: formData.get("jobTitle").trim(),
    company: formData.get("company").trim(),
    applicationDate: formData.get("applicationDate"),
    status: formData.get("status"),
    jobLink: formData.get("jobLink").trim(),
    notes: formData.get("notes").trim()
  };

  const applications = getApplications();
  applications.unshift(application);

  if (!saveApplications(applications)) {
    return;
  }

  alert("Application saved successfully!");

  jobForm.reset();
  setTodayDate();
  jobFormPanel.hidden = true;
});
