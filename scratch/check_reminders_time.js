import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

async function check() {
    const envPath = path.join(process.cwd(), '.env');
    const env = fs.readFileSync(envPath, 'utf8').split('\n').reduce((acc, line) => {
        const [key, ...val] = line.split('=');
        if (key && val.length > 0) acc[key.trim()] = val.join('=').trim();
        return acc;
    }, {});

    const config = {
        host: env.MYSQL_HOST,
        port: parseInt(env.MYSQL_PORT),
        user: env.MYSQL_USER,
        password: env.MYSQL_PASSWORD,
        database: env.MYSQL_DATABASE,
    };

    try {
        const connection = await mysql.createConnection(config);
        
        console.log('--- ALL LOGS TODAY FOR 593981586981 ---');
        const [rows] = await connection.execute(
            'SELECT * FROM chatbot_logs WHERE phone = "593981586981" ORDER BY id DESC LIMIT 20'
        );
        for (const r of rows) {
            console.log(`ID: ${r.id} | TS: ${r.timestamp} | User: ${r.user_msg}`);
            console.log(`Bot: ${r.bot_resp}`);
            console.log(`Tool Result: ${r.tool_execution_result}`);
            console.log('----------------------------------------------------');
        }

        await connection.end();
    } catch (e) {
        console.error('DB Error:', e.stack);
    }
}

check();
