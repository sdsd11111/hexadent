import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

async function diagnose() {
    try {
        const envPath = path.join(process.cwd(), '.env');
        const env = fs.readFileSync(envPath, 'utf8');
        const getVar = (name) => {
            const line = env.split('\n').find(l => l.includes(name + '='));
            return line ? line.split('=')[1].trim().replace(/^["']|["']$/g, '') : null;
        };

        const config = {
            host: getVar('MYSQL_HOST'),
            port: parseInt(getVar('MYSQL_PORT') || '3306'),
            user: getVar('MYSQL_USER'),
            password: getVar('MYSQL_PASSWORD'),
            database: getVar('MYSQL_DATABASE'),
        };

        console.log('--- Database Diagnosis ---');
        const connection = await mysql.createConnection(config);

        const [handoffs] = await connection.execute('SELECT * FROM handoff_sessions');
        console.log('Handoff Sessions:', handoffs);

        const [ignored] = await connection.execute('SELECT * FROM ignored_numbers');
        console.log('Ignored Numbers:', ignored);

        const phone = '593963410409';
        console.log(`Force clearing for: ${phone}`);
        await connection.execute('DELETE FROM handoff_sessions WHERE phone = ?', [phone]);
        await connection.execute('DELETE FROM ignored_numbers WHERE phone = ?', [phone]);

        // Also clear any other similar entries just in case
        await connection.execute('DELETE FROM handoff_sessions WHERE phone LIKE ?', [`%${phone.slice(-9)}`]);

        console.log('--- Cleaning Done ---');
        await connection.end();
        process.exit(0);
    } catch (error) {
        console.error('Diagnosis Error:', error.message);
        process.exit(1);
    }
}

diagnose();
