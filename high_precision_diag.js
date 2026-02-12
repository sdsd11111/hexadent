import fs from 'fs';
import { env } from 'process';

// LOAD ENV
const envContent = fs.readFileSync('.env', 'utf8');
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) process.env[key.trim()] = value.trim().replace(/^"(.*)"$/, '$1');
});

const { default: db } = await import('./lib/db.js');
const { getAvailableSlots } = await import('./lib/chatbot/scripts/calendar_helper.js');

async function debugSaturday() {
    const date = '2026-02-14';
    console.log(`\n--- DEBUGGING ${date} ---`);

    // 1. Raw Blocked Dates
    const [blocked] = await db.execute('SELECT * FROM blocked_dates WHERE blocked_date = ?', [date]);
    console.log("Blocked rows in DB:", blocked);

    // 2. Raw Appointments
    const [appts] = await db.execute('SELECT appointment_time, duration_minutes, status FROM appointments WHERE appointment_date = ?', [date]);
    console.log("Appointments in DB:", appts);

    // 3. Current Time (System and ECU)
    const now = new Date();
    const nowEcuISO = now.toLocaleString("sv-SE", { timeZone: "America/Guayaquil" }).replace(' ', 'T');
    const nowEcu = new Date(nowEcuISO + "-05:00");
    console.log("System Time:", now.toISOString());
    console.log("ECU ISO String:", nowEcuISO);
    console.log("ECU Date Object:", nowEcu.toISOString());

    // 4. Run getAvailableSlots
    console.log("\nRunning getAvailableSlots...");
    const slots = await getAvailableSlots(date, 20);
    console.log("Resulting Slots:", slots.length > 0 ? slots.join(' | ') : "NONE");

    // 5. Test October 10 as requested
    console.log(`\n--- TESTING 2026-10-10 ---`);
    const slotsOct = await getAvailableSlots('2026-10-10', 20);
    console.log("Resulting Slots Oct 10:", slotsOct.length > 0 ? slotsOct.join(' | ') : "NONE");

    process.exit(0);
}

debugSaturday().catch(err => {
    console.error("FATAL ERROR:", err);
    process.exit(1);
});
