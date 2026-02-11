const mysql = require('mysql2/promise');
const fs = require('fs');

async function check() {
    let env = {};
    if (fs.existsSync('.env')) {
        fs.readFileSync('.env', 'utf8').split('\n').filter(Boolean).forEach(l => {
            const [k, v] = l.split('=');
            if (k && v) env[k.trim()] = v.trim().replace(/^"|"$/g, '');
        });
    }

    const c = await mysql.createConnection({
        host: env.MYSQL_HOST,
        user: env.MYSQL_USER,
        password: env.MYSQL_PASSWORD,
        database: env.MYSQL_DATABASE
    });

    const [rows] = await c.execute('SELECT phone, user_msg, bot_resp FROM chatbot_logs WHERE phone LIKE "99999900%" ORDER BY id ASC');
    console.log(JSON.stringify(rows, null, 2));
    await c.end();
}

check().catch(console.error);
