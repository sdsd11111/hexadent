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
        const [rows] = await connection.execute('SELECT phone, name FROM ignored_numbers');
        console.log('--- Ignored Numbers ---');
        console.table(rows);
        
        const [handoff] = await connection.execute('SELECT * FROM handoff_sessions');
        console.log('--- Handoff Sessions ---');
        console.table(handoff);
        
        await connection.end();
    } catch (e) {
        console.error('DB Error:', e.message);
    }
}

check();
