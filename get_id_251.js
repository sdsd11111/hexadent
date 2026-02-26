
const mysql = require('mysql2/promise');

async function getFullRecord() {
    const config = {
        host: 'mysql.us.stackcp.com',
        port: 39908,
        user: 'odontologa-35303936dec6',
        password: 'dhoy9qbzlu',
        database: 'odontologa-35303936dec6'
    };

    try {
        const conn = await mysql.createConnection(config);
        const [rows] = await conn.execute('SELECT * FROM chatbot_logs WHERE id = 251');
        if (rows.length > 0) {
            console.log(JSON.stringify(rows[0], null, 2));
        } else {
            console.log('Record not found.');
        }
        await conn.end();
    } catch (e) {
        console.error(e);
    }
}

getFullRecord();
