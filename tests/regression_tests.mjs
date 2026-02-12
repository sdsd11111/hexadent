import { getAvailableSlots } from '../lib/chatbot/scripts/calendar_helper.js';

async function runTests() {
    console.log("🚀 Starting Regression Tests for Hexadent Logic...");

    const now = new Date();
    // Use the same timezone offset as the server
    const ecuNow = new Date(now.getTime() - (5 * 60 * 60 * 1000));

    // Test 1: 24h Lead Time Rule
    // If it's Thursday at 12:00, Friday before 12:00 must be blocked.
    const tomorrow = new Date(now.getTime() + (24 * 60 * 60 * 1000));
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    console.log(`Checking 24h rule for Tomorrow: ${tomorrowStr}`);
    const tomorrowSlots = await getAvailableSlots(tomorrowStr);

    const morningSlots = tomorrowSlots.filter(s => parseInt(s.split(':')[0]) < 12);

    // For a strict 24h test, we check if the slots are at least 24h from 'now'
    const leadLimitTs = Date.now() + (24 * 60 * 60 * 1000);
    const failures = tomorrowSlots.filter(slot => {
        const [h, m] = slot.split(':');
        const slotTs = new Date(`${tomorrowStr}T${h}:${m}:00Z`).getTime() + (5 * 60 * 60 * 1000);
        return slotTs < leadLimitTs;
    });

    if (failures.length > 0) {
        console.error(`❌ TEST FAILED: Found ${failures.length} slots within 24h window: ${failures.join(', ')}`);
    } else {
        console.log("✅ TEST PASSED: 24h Rule is strictly enforced.");
    }

    // Test 2: Saturday Closing
    // Find next Saturday
    let saturday = new Date();
    while (saturday.getDay() !== 6) saturday.setDate(saturday.getDate() + 1);
    const satStr = saturday.toISOString().split('T')[0];

    const satSlots = await getAvailableSlots(satStr);
    const lateSatSlots = satSlots.filter(s => parseInt(s.split(':')[0]) >= 15);

    if (lateSatSlots.length > 0) {
        console.error(`❌ TEST FAILED: Found Saturday slots at or after 15:00: ${lateSatSlots.join(', ')}`);
    } else {
        console.log("✅ TEST PASSED: Saturday closing (15:00) is enforced.");
    }

    console.log("🏁 Tests finished.");
}

runTests().catch(err => {
    console.error("💥 Test runner crashed:", err);
    process.exit(1);
});
