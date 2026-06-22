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
        
        // Find Luis Cuenca appointments
        const [rows] = await connection.execute(
            `SELECT patient_phone, patient_name, appointment_date, appointment_time, status FROM appointments WHERE patient_name LIKE '%Luis%Cuenca%' OR patient_name LIKE '%Luis%' ORDER BY appointment_date DESC LIMIT 10`
        );
        console.log('=== Luis Cuenca Appointments ===');
        console.table(rows);
        
        // Check today's appointments
        const todayStr = new Date().toISOString().split('T')[0];
        const [todayAppts] = await connection.execute(
            `SELECT patient_name, patient_phone, appointment_date, appointment_time, status FROM appointments WHERE appointment_date = ? AND status = 'scheduled' ORDER BY appointment_time`,
            [todayStr]
        );
        console.log(`\n=== Today's Appointments (${todayStr}) ===`);
        console.table(todayAppts);
        
        await connection.end();
    } catch (e) {
        console.error('DB Error:', e.message);
    }
}

check();