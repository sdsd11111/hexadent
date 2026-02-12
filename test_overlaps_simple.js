
import { getAvailableSlots } from './lib/chatbot/scripts/calendar_helper.js';

async function test() {
    console.log("TEST_START");
    const monday = '2026-07-20';
    const durations = [20, 45];

    for (const d of durations) {
        const slots = await getAvailableSlots(monday, d);
        const filtered = slots.filter(s => s >= '12:00' && s <= '13:00');
        console.log(`DUR_${d}: ${filtered.join(',')}`);
    }
    console.log("TEST_END");
}

test().then(() => process.exit(0)).catch(err => {
    console.error(err);
    process.exit(1);
});
