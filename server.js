require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// In-Memory Patient Storage
let patients = [];

// Email Transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Send Email Function
async function sendEmail(to, subject, html) {
  try {
    await transporter.sendMail({
      from: `SmartMed Notifications <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    });
    console.log(`📩 Email sent to ${to} - ${subject}`);
  } catch (error) {
    console.error('❌ Email error:', error);
  }
}

// Routes
app.get('/', (req, res) => {
  res.send('Welcome to SmartMed API');
});

// Add Patient
app.post('/api/patients', (req, res) => {
  const { name, age, nextCheckup, notes, medication, doctorEmail } = req.body;

  if (!name || age === undefined || !nextCheckup || !notes || !doctorEmail) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const newPatient = {
    id: uuidv4(),
    name,
    age,
    nextCheckup,
    notes,
    medication,
    doctorEmail,
    createdAt: new Date().toISOString()
  };

  patients.push(newPatient);

  // Send Email
  const subject = `🆕 New Patient Added: ${newPatient.name}`;
  const html = `
    <div>
      <h2>New Patient Added</h2>
      <p><strong>Name:</strong> ${newPatient.name}</p>
      <p><strong>Next Checkup:</strong> ${newPatient.nextCheckup}</p>
    </div>
  `;
  sendEmail(newPatient.doctorEmail, subject, html);

  res.status(201).json(newPatient);
});

// Get Patients
app.get('/api/patients', (req, res) => {
  const { doctorEmail } = req.query;
  if (!doctorEmail) return res.status(400).json({ error: 'Doctor email is required' });

  const doctorPatients = patients.filter(p => p.doctorEmail === doctorEmail);
  res.json(doctorPatients);
});

// Update Patient (Reschedule)
app.put('/api/patients/:id', (req, res) => {
  const { nextCheckup } = req.body;
  const patient = patients.find(p => p.id === req.params.id);

  if (!patient) return res.status(404).json({ error: 'Patient not found' });

  patient.nextCheckup = nextCheckup;

  // Send Email
  const subject = `📅 Checkup Rescheduled: ${patient.name}`;
  const html = `
    <div>
      <h2>Checkup Rescheduled</h2>
      <p><strong>Name:</strong> ${patient.name}</p>
      <p><strong>New Checkup Date:</strong> ${patient.nextCheckup}</p>
    </div>
  `;
  sendEmail(patient.doctorEmail, subject, html);

  res.json(patient);
});

// Delete Patient
app.delete('/api/patients/:id', (req, res) => {
  const patientIndex = patients.findIndex(p => p.id === req.params.id);
  if (patientIndex === -1) return res.status(404).json({ error: 'Patient not found' });

  const patient = patients[patientIndex];
  patients.splice(patientIndex, 1);

  // Send Email
  const subject = `❌ Patient Removed: ${patient.name}`;
  const html = `
    <div>
      <h2>Patient Record Deleted</h2>
      <p><strong>Name:</strong> ${patient.name}</p>
      <p>This patient has been removed from your practice.</p>
    </div>
  `;
  sendEmail(patient.doctorEmail, subject, html);

  res.json({ message: 'Patient deleted successfully' });
});

// Check Reminders Every Hour
function checkReminders() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  patients.forEach(patient => {
    const checkupDate = new Date(patient.nextCheckup);
    const diffTime = checkupDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if ([3, 2, 1, 0].includes(diffDays)) {
      const subject = `Checkup Reminder: ${patient.name} in ${diffDays} day(s)`;
      const html = `
        <div>
          <h2>Patient Checkup Reminder</h2>
          <p>Dear Doctor,</p>
          <p><strong>Patient:</strong> ${patient.name}</p>
          <p><strong>Checkup Date:</strong> ${patient.nextCheckup}</p>
          <p>This is a reminder for the upcoming checkup.</p>
        </div>
      `;
      sendEmail(patient.doctorEmail, subject, html);
    }
  });
}

setInterval(checkReminders, 60 * 60 * 1000);

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  checkReminders(); // Run immediately on startup
});
