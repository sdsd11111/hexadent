import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

async function clear() {
    try {
        const env = fs.readFileSync('.env', 'utf8');
        const g = (v) => env.split('\n').find(l => l.includes(v + '=')).split('=')[1].trim().replace(/^['\"]|['\"]$/g, '');
        const c = await mysql.createConnection({
            host: g('MYSQL_HOST'),
            user: g('MYSQL_USER'),
            password: g('MYSQL_PASSWORD'),
            database: g('MYSQL_DATABASE'),
            port: parseInt(g('MYSQL_PORT'))
        });
        await c.execute('DELETE FROM chatbot_logs');
        await c.execute('DELETE FROM chatbot_sessions');
        await c.execute('DELETE FROM handoff_sessions');
        await c.execute('DELETE FROM chatbot_buffer');
        await c.execute('DELETE FROM chatbot_locks');
        await c.execute('DELETE FROM ignored_numbers');
        console.log('CLEANED');
        await c.end();
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
clear();
