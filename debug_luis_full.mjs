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
        
        // Check chatbot logs for 593986426900 (Luis Cuenca's normalized phone)
        const [logs] = await connection.execute(
            `SELECT phone, user_msg, bot_resp, timestamp FROM chatbot_logs WHERE phone = '593986426900' ORDER BY timestamp DESC LIMIT 20`
        );
        console.log('=== Luis Cuenca (593986426900) Chatbot Logs ===');
        for (const log of logs) {
            console.log(`[${log.timestamp}]`);
            console.log(`  USER: "${log.user_msg}"`);
            console.log(`  BOT:  "${log.bot_resp?.substring(0, 200)}"`);
            console.log('');
        }
        
        // Also check for 0986426900
        const [logs2] = await connection.execute(
            `SELECT phone, user_msg, bot_resp, timestamp FROM chatbot_logs WHERE phone = '0986426900' ORDER BY timestamp DESC LIMIT 20`
        );
        console.log('=== Luis Cuenca (0986426900) Chatbot Logs ===');
        console.log(logs2);
        
        await connection.end();
    } catch (e) {
        console.error('DB Error:', e.message);
    }
}

check();