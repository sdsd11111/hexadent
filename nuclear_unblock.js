import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

async function force() {
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

        const connection = await mysql.createConnection(config);
        const phone = '593963410409';

        console.log(`Force deleting ALL mentions of ${phone}...`);

        await connection.execute('DELETE FROM handoff_sessions');
        await connection.execute('DELETE FROM ignored_numbers');
        await connection.execute('DELETE FROM chatbot_locks');
        await connection.execute('DELETE FROM chatbot_buffer');

        console.log('ALL BLOCKING TABLES WIPED CLEAN.');
        await connection.end();
        process.exit(0);
    } catch (error) {
        console.error('ERROR:', error.message);
        process.exit(1);
    }
}

force();
