
const mysql = require('mysql2/promise');

async function test() {
    process.env.MYSQL_HOST = 'mysql.us.stackcp.com';
    process.env.MYSQL_PORT = '39908';
    process.env.MYSQL_USER = 'odontologa-35303936dec6';
    process.env.MYSQL_PASSWORD = 'dhoy9qbzlu';
    process.env.MYSQL_DATABASE = 'odontologa-35303936dec6';

    const { getAvailableSlots } = await import('./lib/chatbot/scripts/calendar_helper.js');

    const targetDate = '2026-02-27';
    const nowTs = Date.now();
    const nowEcu = new Date(nowTs - (5 * 60 * 60 * 1000)).toISOString();

    console.log(`Current Time (ECU approx): ${nowEcu}`);
    console.log(`Checking slots for ${targetDate}`);

    try {
        const slots = await getAvailableSlots(targetDate, 20);
        console.log('Slots:', slots.slice(0, 20).join(', '));
        console.log('Full Count:', slots.length);
        if (slots.includes('11:30')) {
            console.log('SUCCESS: 11:30 is available in logic.');
        } else {
            console.log('FAILURE: 11:30 is NOT available in logic.');
            // Check if it's there but being filtered
        }
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}

test();
