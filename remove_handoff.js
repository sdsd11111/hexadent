import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

async function remove() {
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
        const [result] = await connection.execute('DELETE FROM handoff_sessions WHERE phone = ?', ['593967491847']);
        console.log(`Deleted ${result.affectedRows} handoff session for 593967491847`);
        await connection.end();
    } catch (e) {
        console.error('DB Error:', e.message);
    }
}

remove();
