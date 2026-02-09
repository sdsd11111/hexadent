import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

async function clear() {
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

        console.log('Clearing memory...');
        await connection.execute('DELETE FROM chatbot_logs');
        await connection.execute('DELETE FROM chatbot_sessions');
        await connection.execute('DELETE FROM chatbot_buffer');
        await connection.execute('DELETE FROM chatbot_locks');
        await connection.execute('DELETE FROM handoff_sessions');
        await connection.execute('DELETE FROM ignored_numbers');

        console.log('CLEAN SLATE ACHIEVED');
        await connection.end();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

clear();
