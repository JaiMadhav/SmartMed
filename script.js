const API_BASE_URL = 'http://localhost:3000';
const currentDoctor = {
  email: "jaimadhav2005@gmail.com",
  name: "Dr. Jai Madhav"
};

let patients = []; // Global patients array

document.addEventListener('DOMContentLoaded', () => {
  loadPatients();
  setupEventListeners();
  setupFormValidation();
});

function setupEventListeners() {
  document.getElementById('addPatientForm').addEventListener('submit', handleAddPatient);
  document.getElementById('sortSelect').addEventListener('change', handleSortChange);
  
  // Real-time validation
  document.getElementById('age').addEventListener('input', (e) => {
    if (e.target.value < 0) e.target.value = 0;
    if (e.target.value > 120) e.target.value = 120;
    validateField(e.target);
  });
  
  document.getElementById('nextCheckup').addEventListener('change', (e) => {
    validateField(e.target);
  });
}

// In your setupFormValidation function, add this:
function setupFormValidation() {
  // ... existing code ...
  
  // Make medical notes textarea non-resizable
  const notesTextarea = document.getElementById('notes');
  notesTextarea.style.resize = 'none';
  
  // ... rest of the function ...
}

function validateField(field) {
  const value = field.value.trim();
  const errorElement = document.getElementById(`${field.name}Error`);
  
  // Clear previous errors
  clearError(field, errorElement);
  
  // Check empty fields
  if (field.required && !value) {
    showError(field, errorElement, 'This field is required');
    return false;
  }
  
  // Field-specific validation
  switch(field.name) {
    case 'name':
      if (!/^[a-zA-Z ]+$/.test(value)) {
        showError(field, errorElement, 'Only letters and spaces allowed');
        return false;
      }
      break;
      
    case 'age':
      const age = parseInt(value);
      if (isNaN(age)) {
        showError(field, errorElement, 'Age must be a number');
        return false;
      }
      if (age < 0) {
        showError(field, errorElement, 'Age cannot be negative');
        return false;
      }
      if (age > 120) {
        showError(field, errorElement, 'Age must be 1-120');
        return false;
      }
      break;
      
    case 'nextCheckup':
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDate = new Date(value);
      
      if (selectedDate <= today) {
        showError(field, errorElement, 'Date must be in the future');
        return false;
      }
      break;
  }
  
  return true;
}

function validateForm() {
  let isValid = true;
  const requiredFields = document.getElementById('addPatientForm').querySelectorAll('[required]');
  
  requiredFields.forEach(field => {
    if (!validateField(field)) isValid = false;
  });
  
  return isValid;
}

async function loadPatients(sortBy = 'checkupDate') {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/patients?doctorEmail=${currentDoctor.email}&sortBy=${sortBy}`
    );
    
    if (!response.ok) throw new Error('Failed to load patients');
    
    patients = await response.json();
    renderPatients(patients);
  } catch (error) {
    showAlert('Failed to load patients. Please refresh the page.', 'danger');
  }
}

function renderPatients(patients) {
  const tableBody = document.getElementById('patientsTableBody');
  tableBody.innerHTML = '';
  
  if (!patients || patients.length === 0) {
    tableBody.innerHTML = `
      <tr class="no-patients">
        <td colspan="7">
          <div class="empty-state">
            <i class="bi bi-people-fill"></i>
            <p>No patients found</p>
          </div>
        </td>
      </tr>
    `;
    return;
  }
  
  patients.forEach(patient => {
    const row = document.createElement('tr');
    row.className = 'patient-row';
    row.innerHTML = `
      <td class="patient-id">${patient.id}</td>
      <td class="patient-name">${patient.name}</td>
      <td class="patient-age">${patient.age}</td>
      <td class="patient-checkup">${formatDate(patient.nextCheckup)}</td>
      <td class="patient-notes">${patient.notes}</td>
      <td class="patient-medication">${patient.medication || 'None'}</td>
      <td class="patient-actions">
        <button class="btn btn-sm btn-outline-primary me-2 reschedule-btn">
          <i class="bi bi-calendar-event"></i> Reschedule
        </button>
        <button class="btn btn-sm btn-outline-danger delete-btn">
          <i class="bi bi-trash"></i> Delete
        </button>
      </td>
    `;
    
    row.querySelector('.delete-btn').addEventListener('click', () => deletePatient(patient.id));
    row.querySelector('.reschedule-btn').addEventListener('click', () => rescheduleCheckup(patient.id));
    
    tableBody.appendChild(row);
  });
}

async function handleAddPatient(e) {
  e.preventDefault();
  
  if (!validateForm()) {
    showAlert('Please fix all errors before submitting', 'warning');
    return;
  }

  const formData = {
    name: document.getElementById('name').value.trim(),
    age: parseInt(document.getElementById('age').value),
    nextCheckup: document.getElementById('nextCheckup').value,
    notes: document.getElementById('notes').value.trim(),
    medication: document.getElementById('medication').value.trim(),
    doctorEmail: currentDoctor.email
  };

  try {
    const response = await fetch(`${API_BASE_URL}/api/patients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Server error');
    }
    
    showAlert('Patient added successfully!', 'success');
    document.getElementById('addPatientForm').reset();
    loadPatients();
  } catch (error) {
    showAlert(error.message || 'Failed to add patient', 'danger');
  }
}

async function deletePatient(patientId) {
  const modal = createConfirmationModal(
    'Delete Patient',
    'Are you sure you want to permanently delete this patient record?',
    async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/patients/${patientId}`, {
          method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Delete failed');
        
        showAlert('Patient deleted successfully', 'success');
        loadPatients();
      } catch (error) {
        showAlert('Failed to delete patient', 'danger');
      } finally {
        modal.remove();
      }
    }
  );
  
  document.body.appendChild(modal);
}

async function rescheduleCheckup(patientId) {
  const patient = patients.find(p => p.id === patientId);
  if (!patient) {
    showAlert('Patient not found', 'danger');
    return;
  }

  const modal = document.createElement('div');
  modal.className = 'reschedule-modal';
  modal.innerHTML = `
    <div class="modal-overlay"></div>
    <div class="modal-content">
      <h3>Reschedule Checkup</h3>
      <p>Current date: ${formatDate(patient.nextCheckup)}</p>
      <div class="form-group">
        <label>New Checkup Date</label>
        <input type="date" id="newCheckupDate" class="form-control" 
               min="${new Date().toISOString().split('T')[0]}">
        <small id="dateError" class="error-message"></small>
      </div>
      <div class="modal-actions">
        <button class="btn btn-secondary cancel-btn">Cancel</button>
        <button class="btn btn-primary confirm-btn">Confirm</button>
      </div>
    </div>
  `;

  const newDateInput = modal.querySelector('#newCheckupDate');

  modal.querySelector('.cancel-btn').addEventListener('click', () => modal.remove());
  
  modal.querySelector('.confirm-btn').addEventListener('click', async () => {
    if (!newDateInput.value) {
      document.getElementById('dateError').textContent = 'Please select a date';
      return;
    }

    const selectedDate = new Date(newDateInput.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate <= today) {
      document.getElementById('dateError').textContent = 'Date must be in the future';
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/patients/${patientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nextCheckup: newDateInput.value })
      });
      
      if (!response.ok) throw new Error('Reschedule failed');
      
      showAlert('Checkup rescheduled!', 'success');
      loadPatients();
      modal.remove();
    } catch (error) {
      showAlert('Failed to reschedule: ' + error.message, 'danger');
    }
  });

  document.body.appendChild(modal);
}

function handleSortChange(e) {
  loadPatients(e.target.value);
}

function formatDate(dateString) {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

function createConfirmationModal(title, message, confirmAction) {
  const modal = document.createElement('div');
  modal.className = 'confirmation-modal';
  modal.innerHTML = `
    <div class="modal-overlay"></div>
    <div class="modal-content">
      <h3>${title}</h3>
      <p>${message}</p>
      <div class="modal-actions">
        <button class="btn btn-secondary cancel-btn">Cancel</button>
        <button class="btn btn-danger confirm-btn">Confirm</button>
      </div>
    </div>
  `;
  
  modal.querySelector('.cancel-btn').addEventListener('click', () => modal.remove());
  modal.querySelector('.confirm-btn').addEventListener('click', confirmAction);
  
  return modal;
}

function showAlert(message, type) {
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
  alertDiv.role = 'alert';
  alertDiv.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  `;
  
  const container = document.getElementById('alertContainer');
  container.innerHTML = '';
  container.appendChild(alertDiv);
  
  setTimeout(() => {
    alertDiv.classList.remove('show');
  }, 3000);
}

function showError(field, errorElement, message) {
  field.classList.add('is-invalid');
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = 'block';
  }
}

function clearError(field, errorElement) {
  field.classList.remove('is-invalid');
  if (errorElement) {
    errorElement.textContent = '';
    errorElement.style.display = 'none';
  }
}