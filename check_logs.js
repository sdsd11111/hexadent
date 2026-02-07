const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkLogs() {
    const connection = await mysql.createConnection({
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
        port: process.env.MYSQL_PORT
    });

    const [rows] = await connection.execute('SELECT * FROM chatbot_logs ORDER BY id DESC LIMIT 10');
    console.log(JSON.stringify(rows, null, 2));
    await connection.end();
}

checkLogs().catch(console.error);
