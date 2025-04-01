email-service.js: This JavaScript file contains functions to handle email-related operations, such as sending notifications when adding, deleting or rescheduling.​

index.html: The main HTML file that serves as the entry point to my web page 'SmartMed - Doctor Dashboard' .

patients.json: A JSON file that likely stores data related to patients, such as personal information and medical records used by my application.​

script.js: It covers various functionalities like handling patient addition, rescheduling checkups, form validation, error handling, sorting patients, and more.

server.js
This code sets up a backend API for a healthcare application called SmartMed. The key features include:

Patient Management:

Adds, updates, retrieves, and deletes patient records.

Each patient is associated with a doctor via their email address.

Email Notifications:

Sends email alerts to doctors when a new patient is added, when a patient's checkup is rescheduled, or when a patient is removed.

Sends reminders to doctors about upcoming patient checkups, triggered every hour.

Server Configuration:

Uses Express to handle HTTP requests and routes.

CORS is enabled to allow cross-origin requests.

Nodemailer is configured to send email notifications through a Gmail account.

Checkup Reminders:

A function checks if any patient's checkup is within 3 days and sends a reminder email to the doctor.

style.css: This CSS code is designed to style a healthcare management application with a modern, clean, and responsive interface.
