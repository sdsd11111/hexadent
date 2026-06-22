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
        
        // Check all chatbot logs from today
        const [logs] = await connection.execute(
            `SELECT phone, user_msg, bot_resp, timestamp FROM chatbot_logs ORDER BY timestamp DESC LIMIT 30`
        );
        console.log('=== Recent Chatbot Logs ===');
        for (const log of logs) {
            console.log(`[${log.timestamp}] ${log.phone}: "${log.user_msg?.substring(0, 50)}" -> "${log.bot_resp?.substring(0, 80)}..."`);
        }
        
        await connection.end();
    } catch (e) {
        console.error('DB Error:', e.message);
    }
}

check();