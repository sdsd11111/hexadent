import db from './lib/db.js';

async function checkAppointments() {
    try {
        const [rows] = await db.execute("SELECT * FROM appointments WHERE appointment_date = '2026-02-11' AND status != 'cancelled'");
        console.log(JSON.stringify(rows, null, 2));
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
checkAppointments();
