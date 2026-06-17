const test = require('node:test');
const assert = require('node:assert/strict');

const {
  createAppointment,
  sanitizeText,
  validateAppointment
} = require('../src/appointments');

test('sanitizeText removes angle brackets and trims spaces', () => {
  const result = sanitizeText('  <script>Noah</script>  ');

  assert.equal(result, 'scriptNoah/script');
});

test('validateAppointment accepts a valid appointment request', () => {
  const result = validateAppointment({
    patientName: 'Taylor Smith',
    appointmentType: 'Dental',
    requestedDate: '2026-08-01'
  });

  assert.equal(result.isValid, true);
  assert.deepEqual(result.errors, []);
});

test('validateAppointment rejects invalid appointment type', () => {
  const result = validateAppointment({
    patientName: 'Taylor Smith',
    appointmentType: 'Surgery',
    requestedDate: '2026-08-01'
  });

  assert.equal(result.isValid, false);
  assert.ok(result.errors.includes('Appointment type is not valid.'));
});

test('createAppointment creates a requested appointment', () => {
  const result = createAppointment({
    patientName: 'Casey Johnson',
    appointmentType: 'Vision',
    requestedDate: '2026-08-02'
  });

  assert.equal(result.ok, true);
  assert.equal(result.statusCode, 201);
  assert.equal(result.appointment.status, 'Requested');
  assert.equal(result.appointment.patientName, 'Casey Johnson');
});
