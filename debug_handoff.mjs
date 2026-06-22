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
        
        // Check handoff_sessions for Luis Cuenca
        const [handoff] = await connection.execute(
            `SELECT * FROM handoff_sessions WHERE phone = '593986426900' OR phone = '0986426900'`
        );
        console.log('=== Handoff Sessions for Luis Cuenca ===');
        console.table(handoff);
        
        // Also check all active handoffs
        const [allHandoffs] = await connection.execute(
            `SELECT * FROM handoff_sessions WHERE expires_at > NOW() OR expires_at IS NULL`
        );
        console.log('\n=== All Active Handoffs ===');
        console.table(allHandoffs);
        
        await connection.end();
    } catch (e) {
        console.error('DB Error:', e.message);
    }
}

check();