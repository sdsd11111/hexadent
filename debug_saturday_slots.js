import { getAvailableSlots } from './lib/chatbot/scripts/calendar_helper.js';

async function test() {
    const date = '2026-02-14';
    console.log('--- DEBUG: Slots for', date, '---');
    const slots = await getAvailableSlots(date, 20);
    console.log('Slots:', slots.join(', '));

    if (slots.includes('08:30')) {
        console.log('✅ 08:30 is PRESENT in the engine output.');
    } else {
        console.log('❌ 08:30 is MISSING from the engine output.');
    }
    process.exit(0);
}

test();
