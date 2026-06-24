import 'dotenv/config';
import db from './lib/db.js';

async function query() {
    try {
        console.log('\n========================================');
        console.log('QUERY 1: All appointments for 2026-07-03');
        console.log('========================================');
        const [appts] = await db.execute(
            'SELECT * FROM appointments WHERE appointment_date = ?', 
            ['2026-07-03']
        );
        console.table(appts);

        console.log('\n========================================');
        console.log('QUERY 2: Blocked time slots for 2026-07-03');
        console.log('========================================');
        const [blockedSlots] = await db.execute(
            'SELECT * FROM blocked_time_slots WHERE blocked_date = ?', 
            ['2026-07-03']
        );
        console.table(blockedSlots);

        console.log('\n========================================');
        console.log('QUERY 3: Blocked dates for 2026-07-03');
        console.log('========================================');
        const [blockedDates] = await db.execute(
            'SELECT * FROM blocked_dates WHERE blocked_date = ?', 
            ['2026-07-03']
        );
        console.table(blockedDates);

        console.log('\n========================================');
        console.log('QUERY 4: All appointments for July 3-4 range (all statuses)');
        console.log('========================================');
        const [apptsRange] = await db.execute(
            "SELECT * FROM appointments WHERE appointment_date IN ('2026-07-03', '2026-07-04') ORDER BY appointment_date, appointment_time"
        );
        console.table(apptsRange);

        console.log('\n========================================');
        console.log('RAW DUMP of query 1 results:');
        console.log(JSON.stringify(appts, null, 2));
        console.log('\nRAW DUMP of query 2 results:');
        console.log(JSON.stringify(blockedSlots, null, 2));
        console.log('\nRAW DUMP of query 3 results:');
        console.log(JSON.stringify(blockedDates, null, 2));
        console.log('\nRAW DUMP of query 4 results:');
        console.log(JSON.stringify(apptsRange, null, 2));

        process.exit(0);
    } catch (e) {
        console.error('ERROR:', e.message);
        console.error(e);
        process.exit(1);
    }
}

query();
