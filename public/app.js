const form = document.querySelector('#appointmentForm');
const message = document.querySelector('#message');
const appointmentList = document.querySelector('#appointmentList');

function setMessage(text, type) {
  message.textContent = text;
  message.className = `message ${type}`;
}

function renderAppointments(appointments) {
  appointmentList.innerHTML = '';

  appointments.forEach(appointment => {
    const item = document.createElement('li');

    item.textContent = `${appointment.patientName} requested ${appointment.appointmentType} on ${appointment.requestedDate}. Status is ${appointment.status}.`;

    appointmentList.appendChild(item);
  });
}

async function loadAppointments() {
  const response = await fetch('/api/appointments');
  const data = await response.json();

  renderAppointments(data.appointments);
}

form.addEventListener('submit', async event => {
  event.preventDefault();

  const formData = new FormData(form);

  const payload = {
    patientName: formData.get('patientName'),
    appointmentType: formData.get('appointmentType'),
    requestedDate: formData.get('requestedDate')
  };

  const response = await fetch('/api/appointments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();

  if (!response.ok) {
    setMessage(data.errors.join(' '), 'error');
    return;
  }

  setMessage('Appointment request submitted.', 'success');
  form.reset();
  await loadAppointments();
});

loadAppointments().catch(() => {
  setMessage('Could not load appointments.', 'error');
});
