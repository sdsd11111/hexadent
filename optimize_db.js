import mysql from 'mysql2/promise';
import fs from 'fs';

async function optimize() {
    try {
        const env = fs.readFileSync('.env', 'utf8');
        const g = (v) => env.split('\n').find(l => l.includes(v + '=')).split('=')[1].trim().replace(/^['\"]|['\"]$/g, '');
        const c = await mysql.createConnection({
            host: g('MYSQL_HOST'),
            user: g('MYSQL_USER'),
            password: g('MYSQL_PASSWORD'),
            database: g('MYSQL_DATABASE'),
            port: parseInt(g('MYSQL_PORT')),
            connectTimeout: 5000
        });

        console.log('--- DB OPTIMIZATION START ---');

        console.log('1. Optimizing Appointments Table...');
        await c.execute('ALTER TABLE appointments ADD INDEX IF NOT EXISTS idx_prod_availability (appointment_date, status, appointment_time)');

        console.log('2. Optimizing Blocked Dates...');
        await c.execute('ALTER TABLE blocked_dates ADD INDEX IF NOT EXISTS idx_blocked_date (blocked_date)');

        console.log('3. Optimizing Locked Slots...');
        await c.execute('ALTER TABLE chatbot_locked_slots ADD INDEX IF NOT EXISTS idx_locked_at (locked_at)');

        console.log('--- ALL INDEXES APPLIED ---');
        await c.end();
        process.exit(0);
    } catch (e) {
        console.error('OPTIMIZATION ERROR:', e.message);
        process.exit(1);
    }
}
optimize();
