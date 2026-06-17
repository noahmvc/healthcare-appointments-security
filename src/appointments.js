const appointmentTypes = new Set([
  'Primary Care',
  'Dental',
  'Vision',
  'Nutrition',
  'Mental Health'
]);

const appointments = [
  {
    id: 1,
    patientName: 'Jordan Taylor',
    appointmentType: 'Primary Care',
    requestedDate: '2026-07-15',
    status: 'Requested'
  },
  {
    id: 2,
    patientName: 'Morgan Lee',
    appointmentType: 'Nutrition',
    requestedDate: '2026-07-16',
    status: 'Requested'
  }
];

function getAppointments() {
  return appointments;
}

function getAppointmentTypes() {
  return Array.from(appointmentTypes);
}

function sanitizeText(value) {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim().replace(/[<>]/g, '');
}

function isValidDate(value) {
  if (typeof value !== 'string') {
    return false;
  }

  const datePattern = /^\d{4}-\d{2}-\d{2}$/;

  if (!datePattern.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00Z`);

  return !Number.isNaN(date.getTime());
}

function validateAppointment(input) {
  const errors = [];

  const patientName = sanitizeText(input.patientName);
  const appointmentType = sanitizeText(input.appointmentType);
  const requestedDate = sanitizeText(input.requestedDate);

  if (patientName.length < 2 || patientName.length > 80) {
    errors.push('Patient name must be between 2 and 80 characters.');
  }

  if (!appointmentTypes.has(appointmentType)) {
    errors.push('Appointment type is not valid.');
  }

  if (!isValidDate(requestedDate)) {
    errors.push('Requested date must use YYYY-MM-DD format.');
  }

  return {
    isValid: errors.length === 0,
    errors,
    cleanAppointment: {
      patientName,
      appointmentType,
      requestedDate
    }
  };
}

function createAppointment(input) {
  const validation = validateAppointment(input);

  if (!validation.isValid) {
    return {
      ok: false,
      statusCode: 400,
      errors: validation.errors
    };
  }

  const nextAppointment = {
    id: appointments.length + 1,
    ...validation.cleanAppointment,
    status: 'Requested'
  };

  appointments.push(nextAppointment);

  return {
    ok: true,
    statusCode: 201,
    appointment: nextAppointment
  };
}

module.exports = {
  createAppointment,
  getAppointments,
  getAppointmentTypes,
  sanitizeText,
  validateAppointment
};
