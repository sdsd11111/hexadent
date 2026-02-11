import { getAvailableSlots } from './lib/chatbot/scripts/calendar_helper.js';

async function run() {
    console.log('--- Saturday Feb 14 Verification ---');
    try {
        // Child 60min
        const childSlots = await getAvailableSlots('2026-02-14', 60);
        console.log('Saturday Feb 14 (60min slots):', childSlots.join(' | '));

        // Adult 20min
        const adultSlots = await getAvailableSlots('2026-02-14', 20);
        console.log('Saturday Feb 14 (20min Last slots):', adultSlots.slice(-10).join(' | '));

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
run();
