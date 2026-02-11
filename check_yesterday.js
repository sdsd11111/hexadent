
const mysql = require('mysql2/promise');

async function checkYesterday() {
    const config = {
        host: 'mysql.us.stackcp.com',
        port: 39908,
        user: 'odontologa-35303936dec6',
        password: 'dhoy9qbzlu',
        database: 'odontologa-35303936dec6',
    };

    try {
        const connection = await mysql.createConnection(config);
        console.log('Checking appointments for 2026-02-10...');

        const [rows] = await connection.execute(
            "SELECT * FROM appointments WHERE appointment_date = '2026-02-10'"
        );

        console.log('Found:', rows.length, 'appointments');
        if (rows.length > 0) {
            console.log(JSON.stringify(rows, null, 2));
        }

        await connection.end();
    } catch (err) {
        console.error('✗ FAILED:', err.message);
    }
}

checkYesterday();
