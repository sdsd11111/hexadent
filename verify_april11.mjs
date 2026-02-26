
import { getAvailableSlots } from './lib/chatbot/scripts/calendar_helper.js';

async function test() {
    try {
        const slots = await getAvailableSlots('2026-04-11', 20);
        console.log('Slots April 11th (Saturday):', slots.join(', '));
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}

test();
