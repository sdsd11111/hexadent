import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

async function createTestAppointment() {
    const envPath = path.join(process.cwd(), '.env');
    const env = fs.readFileSync(envPath, 'utf8').split('\n').reduce((acc, line) => {
        const [key, ...val] = line.split('=');
        if (key && val.length > 0) acc[key.trim()] = val.join('=').trim();
        return acc;
    }, {});

    const config = {
        host: env.MYSQL_HOST,
        port: parseInt(env.MYSQL_PORT),
        user: env.MYSQL_USER,
        password: env.MYSQL_PASSWORD,
        database: env.MYSQL_DATABASE,
    };

    try {
        const connection = await mysql.createConnection(config);
        
        // Insert test appointment for 593967491847 (12 columns)
        const [result] = await connection.execute(
            `INSERT INTO appointments (patient_name, patient_phone, patient_cedula, patient_age, appointment_date, appointment_time, duration_minutes, status, motive, reminder_sent, active_slot) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0)`,
            ['TEST Paciente', '593967491847', '1234567890', 30, '2026-06-22', '13:30:00', 20, 'scheduled', 'Prueba de Confirmación']
        );
        
        console.log('=== Test Appointment Created ===');
        console.log('ID:', result.insertId);
        
        // Verify
        const [rows] = await connection.execute(
            `SELECT * FROM appointments WHERE id = ?`,
            [result.insertId]
        );
        console.table(rows);
        
        await connection.end();
    } catch (e) {
        console.error('Error:', e.message);
    }
}

createTestAppointment();