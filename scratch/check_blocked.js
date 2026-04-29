import fs from 'fs';
if (fs.existsSync('.env')) {
    const envContent = fs.readFileSync('.env', 'utf8');
    envContent.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
            const value = valueParts.join('=').trim().replace(/^"(.*)"$/, '$1');
            process.env[key.trim()] = value;
        }
    });
}
import db from '../lib/db.js';

async function checkBlockedDates() {
    try {
        const [rows] = await db.execute('SELECT * FROM blocked_dates WHERE blocked_date >= CURDATE() ORDER BY blocked_date ASC');
        console.log('--- BLOCKED DATES (Future/Today) ---');
        if (rows.length === 0) {
            console.log('No blocked dates found.');
        } else {
            rows.forEach(row => {
                console.log(`- Date: ${row.blocked_date.toISOString().split('T')[0]}, Reason: ${row.reason}`);
            });
        }
        process.exit(0);
    } catch (error) {
        console.error('Error checking blocked dates:', error);
        process.exit(1);
    }
}

checkBlockedDates();
