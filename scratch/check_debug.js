const mysql = require('mysql2/promise');
(async () => {
    const c = await mysql.createConnection({
        host: 'mysql.us.stackcp.com',
        port: 43192,
        user: 'pdfs-texto-3139329864',
        password: '9f4j6r1lml',
        database: 'pdfs-texto-3139329864'
    });
    // Check time blocks
    const [blocks] = await c.execute(
        "SELECT * FROM blocked_time_slots WHERE blocked_date='2026-07-03'"
    );
    console.log("=== BLOCKED TIME SLOTS July 3 ===");
    console.table(blocks);
    
    // Check ALL appointments with long durations
    const [long] = await c.execute(
        "SELECT id,patient_name,appointment_date,appointment_time,duration_minutes,status FROM appointments WHERE duration_minutes > 120 ORDER BY duration_minutes DESC"
    );
    console.log("=== CITAS CON DURACION > 120 min ===");
    console.table(long);
    
    // Check all blocked dates
    const [bd] = await c.execute("SELECT * FROM blocked_dates WHERE DATE_FORMAT(blocked_date,'%Y-%m-%d')>='2026-07-01'");
    console.log("=== BLOCKED DATES ===");
    console.table(bd);
    
    await c.end();
})();
