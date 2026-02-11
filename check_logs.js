
const mysql = require('mysql2/promise');

async function checkLogs() {
    const config = {
        host: 'mysql.us.stackcp.com',
        port: 39908,
        user: 'odontologa-35303936dec6',
        password: 'dhoy9qbzlu',
        database: 'odontologa-35303936dec6',
    };

    try {
        const connection = await mysql.createConnection(config);
        console.log('Checking recent logs...');

        const [rows] = await connection.execute(
            "SELECT * FROM chatbot_logs WHERE user_msg LIKE '%Cristhopher%' OR bot_resp LIKE '%Cristhopher%' OR timestamp > NOW() - INTERVAL 1 DAY ORDER BY timestamp DESC LIMIT 10"
        );

        console.log('Found:', rows.length, 'logs');
        if (rows.length > 0) {
            console.log(JSON.stringify(rows.map(r => ({
                id: r.id,
                time: r.timestamp,
                phone: r.phone,
                user: r.user_msg,
                bot: r.bot_resp,
                tool: r.tool_execution_result
            })), null, 2));
        }

        await connection.end();
    } catch (err) {
        console.error('✗ FAILED:', err.message);
    }
}

checkLogs();
