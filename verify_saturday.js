import fs from 'fs';

// Load .env manually
try {
    const env = fs.readFileSync('.env', 'utf8');
    env.split('\n').forEach(line => {
        const parts = line.split('=');
        if (parts.length >= 2) {
            const key = parts[0].trim();
            const value = parts.slice(1).join('=').trim();
            if (key && !key.startsWith('#')) {
                process.env[key] = value;
            }
        }
    });
    console.log('✅ ENV loaded');
} catch (e) {
    console.error('❌ Failed to load .env', e);
}

// Dynamic import to ensure env is loaded BEFORE db connection happens
const { getAvailableSlotsDebug } = await import('./lib/chatbot/scripts/calendar_helper_v2.js');

async function run() {
    console.log('--- VERIFY SATURDAY 14 (V2 + ENV) ---');
    try {
        const slots = await getAvailableSlotsDebug('2026-02-14', 20);
        console.log(`Slots found: ${slots.length}`);

        const afternoon = slots.filter(s => parseInt(s.split(':')[0]) >= 13);
        console.log('Afternoon slots (13:00+):', afternoon.join(' | '));

        if (slots.length > 0) {
            console.log('✅ SUCCESS: Slots are generating.');
        } else {
            console.log('❌ FAIL: No slots generated.');
        }
    } catch (e) {
        console.error('FATAL ERROR CAUGHT:', e);
    }
}
run();
