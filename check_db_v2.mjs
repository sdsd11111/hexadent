import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function checkAppointments() {
    const config = {
        host: process.env.MYSQL_HOST,
        port: parseInt(process.env.MYSQL_PORT),
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE
    };

    try {
        const connection = await mysql.createConnection(config);
        const [rows] = await connection.execute("SELECT patient_name, appointment_time, duration_minutes, created_at FROM appointments WHERE appointment_date = '2026-02-11' AND status != 'cancelled'");
        console.log(JSON.stringify(rows, null, 2));
        await connection.end();
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
checkAppointments();
