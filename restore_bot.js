import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

async function restore() {
    // Read .env manually
    const envPath = path.join(process.cwd(), '.env');
    const env = fs.readFileSync(envPath, 'utf8');
    const getVar = (name) => env.split('\n').find(l => l.startsWith(name))?.split('=')[1]?.trim();

    const config = {
        host: getVar('MYSQL_HOST'),
        port: parseInt(getVar('MYSQL_PORT')),
        user: getVar('MYSQL_USER'),
        password: getVar('MYSQL_PASSWORD'),
        database: getVar('MYSQL_DATABASE'),
    };

    console.log('Connecting to:', config.host, config.database);

    const connection = await mysql.createConnection(config);

    try {
        console.log('Clearing handoff_sessions...');
        await connection.execute('DELETE FROM handoff_sessions');
        console.log('Clearing ignored_numbers...');
        await connection.execute('DELETE FROM ignored_numbers');
        console.log('UNBLOCKED SUCCESSFULLY');
    } catch (error) {
        console.error('Error unblocking:', error.message);
    } finally {
        await connection.end();
        process.exit(0);
    }
}

restore();
