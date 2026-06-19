const db = require('./lib/db.js').default;

(async () => {
    const [rows] = await db.execute(
        'SELECT patient_phone, patient_name, appointment_date, appointment_time FROM appointments WHERE appointment_date >= "2026-06-15" ORDER BY appointment_date DESC LIMIT 10'
    );
    console.log(JSON.stringify(rows, null, 2));
    process.exit(0);
})();