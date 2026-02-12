import fs from 'fs';
import { env } from 'process';

// LOAD ENV FIRST
const envContent = fs.readFileSync('.env', 'utf8');
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) process.env[key.trim()] = value.trim().replace(/^"(.*)"$/, '$1');
});

// NOW IMPORT MODULES
const { default: db } = await import('./lib/db.js');
const { getAvailableSlots } = await import('./lib/chatbot/scripts/calendar_helper.js');

async function diagnose() {
    console.log("--- HEXADENT FINAL DIAGNOSTICS ---");

    // 1. Check Blocked Dates
    const [blocked] = await db.execute('SELECT * FROM blocked_dates');
    console.log("\n1. BLOCKED DATES IN DB:");
    console.table(blocked);

    const nowStr = new Date().toLocaleString("sv-SE", { timeZone: "America/Guayaquil" }).replace(' ', 'T');
    const nowEcu = new Date(nowStr + "-05:00");
    console.log(`Current Time (Ecuador): ${nowEcu.toISOString()}`);

    const testDates = ['2026-02-13', '2026-02-14', '2026-07-25'];

    for (const date of testDates) {
        console.log(`\nSLOTS FOR ${date}:`);
        try {
            const slots = await getAvailableSlots(date, 20);
            if (slots.length > 0) {
                console.log(`✅ OK: ${slots.length} slots found.`);
                console.log(slots.slice(0, 5).join(' | ') + " ...");
            } else {
                console.log("❌ NONE");
            }
        } catch (e) {
            console.error(`❌ ERROR for ${date}:`, e);
        }
    }

    process.exit(0);
}

diagnose().catch(err => {
    console.error(err);
    process.exit(1);
});
