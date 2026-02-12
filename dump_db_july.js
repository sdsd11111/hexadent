
import db from './lib/db.js';
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

async function dump() {
    console.log("--- DATABASE DUMP (JULY 2026) ---");

    console.log("\nAppointments:");
    const [appts] = await db.execute('SELECT * FROM appointments WHERE appointment_date LIKE "2026-07%"');
    console.table(appts);

    console.log("\nBlocked Dates:");
    const [blocked] = await db.execute('SELECT * FROM blocked_dates WHERE blocked_date LIKE "2026-07%"');
    console.table(blocked);

    console.log("\nLocked Slots:");
    const [locks] = await db.execute('SELECT * FROM chatbot_locked_slots WHERE date LIKE "2026-07%"');
    console.table(locks);
}

dump().then(() => process.exit(0)).catch(err => {
    console.error(err);
    process.exit(1);
});
