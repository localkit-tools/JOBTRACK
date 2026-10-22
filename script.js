
"use strict";

// JobTrack - Application form controls

const addJobButton = document.getElementById("addJobButton");
const jobFormPanel = document.getElementById("jobFormPanel");
const closeJobForm = document.getElementById("closeJobForm");
const jobForm = document.getElementById("jobForm");

// Open the application form
addJobButton.addEventListener("click", function () {
  jobFormPanel.hidden = false;
  jobFormPanel.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
});

// Close the application form
closeJobForm.addEventListener("click", function () {
  jobFormPanel.hidden = true;
});

// Set today's date as the default application date
const dateInput = jobForm.elements.applicationDate;

dateInput.value = new Date().toLocaleDateString("en-CA");
