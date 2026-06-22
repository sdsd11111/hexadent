// Debug script to check Luis Cuenca conversation
const mysql = require('mysql2/promise');

async function checkLuisConversation() {
    const pool = mysql.createPool({
        host: process.env.MYSQL_HOST,
        port: process.env.MYSQL_PORT,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
        waitForConnections: true,
        connectionLimit: 5
    });

    try {
        // Find Luis Cuenca's phone - search by name or common patterns
        const [users] = await pool.execute(`
            SELECT DISTINCT patient_phone, patient_name 
            FROM appointments 
            WHERE patient_name LIKE '%Luis%' OR patient_name LIKE '%Cuenca%'
            ORDER BY appointment_date DESC
            LIMIT 10
        `);
        
        console.log('=== Luis Cuenca Appointments ===');
        console.log(users);
        
        // Check today's appointments
        const today = new Date().toISOString().split('T')[0];
        const [todayAppts] = await pool.execute(`
            SELECT patient_name, patient_phone, appointment_date, appointment_time, status
            FROM appointments 
            WHERE appointment_date = ? AND status = 'scheduled'
            ORDER BY appointment_time
        `, [today]);
        
        console.log(`\n=== Today's Appointments (${today}) ===`);
        console.log(todayAppts);
        
    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        await pool.end();
        process.exit(0);
    }
}

checkLuisConversation();