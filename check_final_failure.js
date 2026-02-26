
const mysql = require('mysql2/promise');

async function check() {
    const config = { host: 'mysql.us.stackcp.com', port: 39908, user: 'odontologa-35303936dec6', password: 'dhoy9qbzlu', database: 'odontologa-35303936dec6' };
    try {
        const conn = await mysql.createConnection(config);
        const [rows] = await conn.execute('SELECT id, user_msg, bot_resp, tool_execution_result FROM chatbot_logs WHERE phone="593983237491" ORDER BY id DESC LIMIT 5');
        rows.forEach(row => {
            console.log(`\n--- ID: ${row.id} ---`);
            console.log(`USER: ${row.user_msg}`);
            console.log(`BOT: ${row.bot_resp}`);
            console.log(`TOOL_RESULT: ${row.tool_execution_result}`);
        });
        await conn.end();
    } catch (e) {
        console.error('Error:', e.message);
    }
}
check();
