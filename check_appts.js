import db from './lib/db.js';

const [rows] = await db.execute(
  'SELECT id, patient_name, patient_phone, appointment_date, appointment_time, status FROM appointments ORDER BY id DESC LIMIT 10'
);
console.table(rows);
process.exit(0);