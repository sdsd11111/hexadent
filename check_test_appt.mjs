import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

async function check() {
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
        
        // Check for appointment with 593967491847
        const [rows] = await connection.execute(
            `SELECT patient_name, patient_phone, appointment_date, appointment_time, status FROM appointments WHERE patient_phone = ? AND status = 'scheduled' AND appointment_date >= CURDATE() ORDER BY appointment_date ASC`,
            ['593967491847']
        );
        
        console.log('=== Appointment for 593967491847 ===');
        console.table(rows);
        
        await connection.end();
    } catch (e) {
        console.error('Error:', e.message);
    }
}

check();