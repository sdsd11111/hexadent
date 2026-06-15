import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

async function clearHandoff() {
    const envPath = path.join(process.cwd(), '.env');
    const env = fs.readFileSync(envPath, 'utf8').split('\n').reduce((acc, line) => {
        const [key, ...val] = line.split('=');
        if (key && val.length > 0) acc[key.trim()] = val.join('=').trim().replace(/^['"]|['"]$/g, '');
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
        const phone = '593967491847';
        
        console.log(`🗑️ Borrando handoff para: ${phone}`);
        const [res] = await connection.execute(
            'DELETE FROM handoff_sessions WHERE phone = ? OR phone LIKE ?',
            [phone, `%${phone.slice(-9)}`]
        );
        console.log(`✅ Handoff borrado: ${res.affectedRows} registro(s)`);

        await connection.end();
    } catch (e) {
        console.error('DB Error:', e.stack);
    }
}

clearHandoff();
