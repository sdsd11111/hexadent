import fs from 'fs';
import path from 'path';

// Manual .env loader
const envPath = path.resolve('d:/Abel paginas/Hexadent/2do intento/hexadent-main/.env');
if (fs.existsSync(envPath)) {
    const env = fs.readFileSync(envPath, 'utf8');
    env.split('\n').forEach(line => {
        const [key, ...value] = line.split('=');
        if (key && value.length) {
            process.env[key.trim()] = value.join('=').trim().replace(/^['"]|['"]$/g, '');
        }
    });
}

import { getAvailableSlots, bookAppointment } from './lib/chatbot/scripts/calendar_helper.js';

async function verify() {
    console.log(`--- Verifying Manual Booking Integration ---`);
    const testDate = '2026-06-16'; // Tuesday

    console.log(`Checking slots for ${testDate}...`);

    try {
        // 1. Initial slots for admin (should bypass lead time)
        const adminSlots = await getAvailableSlots(testDate, 20, null, true);
        console.log(`Admin available slots count:`, adminSlots.length);

        if (adminSlots.length === 0) {
            console.log(`❌ FAILURE: No admin slots available for ${testDate}. Check if date is blocked or Sunday.`);
            process.exit(1);
        }

        const slotToBook = adminSlots[0];
        console.log(`Selected slot: ${slotToBook}`);

        // 2. Initial slots for bot
        const botSlotsBefore = await getAvailableSlots(testDate, 20, null, false);
        const isAvailForBotBefore = botSlotsBefore.includes(slotToBook);
        console.log(`Bot slots before: ${isAvailForBotBefore ? 'AVAILABLE' : 'BLOCKED'}`);

        // 3. Manual booking
        console.log(`Booking manually...`);
        const result = await bookAppointment({
            name: 'Test Manual Patient',
            date: testDate,
            time: slotToBook,
            motive: 'Verification test',
            age: 30
        }, true); // isAdmin = true

        console.log(`Booking result: ${JSON.stringify(result)}`);

        // 4. Check slots for bot again
        const botSlotsAfter = await getAvailableSlots(testDate, 20, null, false);
        const isBlockedForBot = !botSlotsAfter.includes(slotToBook);
        console.log(`Bot slots after: ${isBlockedForBot ? 'BLOCKED' : 'AVAILABLE'}`);

        if (isBlockedForBot) {
            console.log('✅ SUCCESS: Manual booking correctly blocks slot for the bot.');
        } else {
            console.log('❌ FAILURE: Slot is still available for the bot.');
        }
    } catch (error) {
        console.error('An error occurred:', error.message);
    }

    process.exit(0);
}

verify();
