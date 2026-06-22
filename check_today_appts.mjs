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
        
        // Check today's appointments
        const [rows] = await connection.execute(
            `SELECT patient_name, patient_phone, appointment_date, appointment_time, status FROM appointments WHERE appointment_date = '2026-06-22' AND status = 'scheduled' ORDER BY appointment_time`
        );
        console.log('=== Today Appointments ===');
        console.table(rows);
        
        // Check specifically for 593967491847
        const [test] = await connection.execute(
            `SELECT * FROM appointments WHERE patient_phone LIKE '%967491847%' AND status = 'scheduled'`
        );
        console.log('\n=== For 967491847 ===');
        console.table(test);
        
        await connection.end();
    } catch (e) {
        console.error('Error:', e.message);
    }
}

check();