// Debug script to check Luis Cuenca conversation
const db = require('./lib/db');

async function checkLuisConversation() {
    try {
        // Find Luis Cuenca's phone - search by name or common patterns
        const [users] = await db.execute(`
            SELECT DISTINCT patient_phone, patient_name 
            FROM appointments 
            WHERE patient_name LIKE '%Luis%' OR patient_name LIKE '%Cuenca%'
            ORDER BY appointment_date DESC
            LIMIT 10
        `);
        
        console.log('=== Luis Cuenca Appointments ===');
        console.log(users);
        
        // Also check chatbot_logs for any messages from numbers containing 99 or similar
        const [logs] = await db.execute(`
            SELECT phone, user_msg, bot_resp, timestamp 
            FROM chatbot_logs 
            WHERE user_msg LIKE '%Luis%' OR user_msg LIKE '%Cuenca%' OR user_msg LIKE '%si%'
            ORDER BY timestamp DESC
            LIMIT 20
        `);
        
        console.log('\n=== Chatbot Logs (recent) ===');
        for (const log of logs) {
            console.log(`[${log.timestamp}] ${log.phone}: "${log.user_msg}" -> "${log.bot_resp?.substring(0, 100)}..."`);
        }
        
        // Check today's appointments
        const today = new Date().toISOString().split('T')[0];
        const [todayAppts] = await db.execute(`
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
        process.exit(0);
    }
}

checkLuisConversation();