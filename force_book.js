import fs from 'fs';
if (fs.existsSync('.env')) {
    const envContent = fs.readFileSync('.env', 'utf8');
    envContent.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) process.env[key.trim()] = value.trim().replace(/^"(.*)"$/, '$1');
    });
}

const { default: db } = await import('./lib/db.js');

const [result] = await db.execute(
    'INSERT INTO appointments (patient_name, patient_phone, patient_cedula, patient_age, appointment_date, appointment_time, duration_minutes, status, motive) VALUES (?, ?, ?, ?, ?, ?, ?, "scheduled", ?)',
    ['Cristhopher Reyes', '593967491847', '1105106866', 24, '2026-06-15', '16:00', 45, 'Consulta General']
);

console.log('Appointment created with ID:', result.insertId);
process.exit(0);