import { getAvailableSlots } from './lib/chatbot/scripts/calendar_helper.js';

async function test() {
    const slots = await getAvailableSlots('2026-07-25', 20);
    console.log('Slots for 2026-07-25 (Saturday):');
    console.log(JSON.stringify(slots, null, 2));

    const isFivePMAvailable = slots.includes('17:00');
    console.log(`Is 17:00 in slots? ${isFivePMAvailable}`);
}

test().catch(console.error);
