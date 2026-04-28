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
        const todayStr = new Date().toISOString().split('T')[0];
        const [rows] = await connection.execute('SELECT * FROM appointments WHERE patient_phone LIKE "%967491847%" AND appointment_date = ?', [todayStr]);
        console.log(`--- Appointments for CR TODAY (${todayStr}) ---`);
        console.table(rows);
        
        await connection.end();
    } catch (e) {
        console.error('DB Error:', e.message);
    }
}

check();
