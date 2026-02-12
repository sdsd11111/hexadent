import fs from 'fs';
// Load env
const envContent = fs.readFileSync('.env', 'utf8');
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) process.env[key.trim()] = value.trim().replace(/^"(.*)"$/, '$1');
});

import db from './lib/db.js';

async function fix() {
    console.log("Cleaning blocked_dates...");
    await db.execute("DELETE FROM blocked_dates WHERE blocked_date = '2026-02-14'");
    console.log("Saturday Feb 14 Unblocked.");

    // Check if there are any other weird ones
    const [rows] = await db.execute("SELECT * FROM blocked_dates");
    console.table(rows);

    process.exit(0);
}

fix().catch(err => {
    console.error(err);
    process.exit(1);
});
