import('./lib/db.js').then(async (mod) => {
    const db = mod.default;
    const [rows] = await db.execute(
        'SELECT id, patient_name, appointment_date, appointment_time, status FROM appointments WHERE appointment_date = ?',
        ['2026-06-13']
    );
    console.log('Appointments on June 13:', JSON.stringify(rows, null, 2));
    process.exit(0);
});