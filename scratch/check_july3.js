const mysql = require('mysql2/promise');
(async () => {
    const c = await mysql.createConnection({
        host: 'mysql.us.stackcp.com',
        port: 43192,
        user: 'pdfs-texto-3139329864',
        password: '9f4j6r1lml',
        database: 'pdfs-texto-3139329864'
    });
    const [r] = await c.execute(
        "SELECT id,patient_name,appointment_date,appointment_time,duration_minutes,status FROM appointments WHERE appointment_date='2026-07-03' ORDER BY appointment_time"
    );
    console.table(r);
    await c.end();
})();
