import fs from 'fs';
if (fs.existsSync('.env')) {
    const envContent = fs.readFileSync('.env', 'utf8');
    envContent.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) process.env[key.trim()] = value.trim().replace(/^"(.*)"$/, '$1');
    });
}

import db from './lib/db.js';

async function main() {
    const [r] = await db.execute(
        'INSERT INTO appointments (patient_name, patient_phone, patient_cedula, patient_age, appointment_date, appointment_time, duration_minutes, status, motive) VALUES (?, ?, ?, ?, ?, ?, ?, "scheduled", ?)',
        ['TEST Paciente', '593967491847', '1234567890', 30, '2026-06-22', '13:30', 20, 'Prueba Confirm']
    );
    console.log('Created ID:', r.insertId);
    process.exit(0);
}

main();