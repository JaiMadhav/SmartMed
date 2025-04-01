const nodemailer = require("nodemailer");

// Email setup
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "notifications.smartmed@gmail.com",
        pass: "ParthLukeshJai@SmartMed2025" // 🔹 Replace with your App Password
    }
});

// Sample patient data
const patients = [
    { name: "Rahul Verma", age: "45", nextCheckup: "2025-04-05", notes: "Diabetes", medication: "Metformin 500mg daily" },
    { name: "Anjali Sharma", age: "38", nextCheckup: "2025-04-07", notes: "Hypertension", medication: "Amlodipine 5mg daily" },
    { name: "Invalid123", age: "XX", nextCheckup: "", notes: "!!", medication: "###" } // Invalid data example
];

// Regex patterns for validation
const regexPatterns = {
    name: /^[A-Za-z\s]+$/,  // Only letters and spaces
    age: /^\d+$/,  // Only numbers
    nextCheckup: /^\d{4}-\d{2}-\d{2}$/,  // YYYY-MM-DD
    notes: /^[A-Za-z0-9\s]+$/,  // Alphanumeric + spaces
    medication: /^.+$/ // Alphanumeric + spaces
};

// Validate patient data
function isValidPatient(patient) {
    return patient.name && regexPatterns.name.test(patient.name) &&
           patient.age && regexPatterns.age.test(patient.age) &&
           patient.nextCheckup && regexPatterns.nextCheckup.test(patient.nextCheckup) &&
           patient.notes && regexPatterns.notes.test(patient.notes) &&
           patient.medication && regexPatterns.medication.test(patient.medication) &&
           patient.email && regexPatterns.email.test(patient.email);
}


// Function to send email
function sendTestEmail() {
    patients.forEach(patient => {
        if (!isValidPatient(patient)) {
            console.log(`❌ Skipping invalid patient: ${JSON.stringify(patient)}`);
            return;
        }

        const mailOptions = {
            from: "jaiforstudy01@gmail.com",
            to: "jaiforstudy01@gmail.com",
            subject: `🔔 Test Reminder for ${patient.name}`,
            text: `Dear Doctor,\n\nReminder: ${patient.name}'s checkup is coming up!\n🩺 Condition: ${patient.notes}\n💊 Medication: ${patient.medication}\n\n📅 Date: ${patient.nextCheckup}\n\n📩 This is a test email from SmartMed.`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) console.log("❌ Error sending email:", error);
            else console.log(`📩 Email sent:`, info.response);
        });
    });
}

// Run the function to send emails immediately
sendTestEmail();
