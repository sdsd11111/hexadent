import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

async function unblock() {
    try {
        const envPath = path.join(process.cwd(), '.env');
        const env = fs.readFileSync(envPath, 'utf8');
        const getVar = (name) => env.split('\n').find(l => l.startsWith(name))?.split('=')[1]?.trim();

        const connection = await mysql.createConnection({
            host: getVar('MYSQL_HOST'),
            port: parseInt(getVar('MYSQL_PORT')),
            user: getVar('MYSQL_USER'),
            password: getVar('MYSQL_PASSWORD'),
            database: getVar('MYSQL_DATABASE'),
        });

        const phone = '593963410409';
        console.log(`Unblocking number: ${phone}`);

        await connection.execute('DELETE FROM handoff_sessions WHERE phone = ?', [phone]);
        await connection.execute('DELETE FROM ignored_numbers WHERE phone = ?', [phone]);

        console.log('UNBLOCKED SUCCESSFULLY');
        await connection.end();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

unblock();
