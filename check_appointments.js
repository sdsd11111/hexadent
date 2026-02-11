
const mysql = require('mysql2/promise');

async function checkAppointments() {
    const config = {
        host: 'mysql.us.stackcp.com',
        port: 39908,
        user: 'odontologa-35303936dec6',
        password: 'dhoy9qbzlu',
        database: 'odontologa-35303936dec6',
    };

    try {
        const connection = await mysql.createConnection(config);
        console.log('Checking recent appointments...');

        // Search for Cristhopher Reyes or any appointment on 2026-02-11
        const [rows] = await connection.execute(
            "SELECT * FROM appointments WHERE patient_name LIKE '%Cristhopher%' OR appointment_date = '2026-02-11' ORDER BY created_at DESC"
        );

        console.log('Found:', rows.length, 'matches');
        if (rows.length > 0) {
            console.log(JSON.stringify(rows.map(r => ({
                id: r.id,
                name: r.patient_name,
                date: r.appointment_date,
                time: r.appointment_time,
                status: r.status,
                created: r.created_at
            })), null, 2));
        } else {
            console.log('No matches found for Cristhopher or 2026-02-11');
        }

        await connection.end();
    } catch (err) {
        console.error('✗ FAILED:', err.message);
    }
}

checkAppointments();
