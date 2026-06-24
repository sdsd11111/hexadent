const mysql = require('mysql2/promise');
(async () => {
    const c = await mysql.createConnection({
        host: 'mysql.us.stackcp.com', port: 43192,
        user: 'pdfs-texto-3139329864', password: '9f4j6r1lml',
        database: 'pdfs-texto-3139329864'
    });
    
    // Simular el overlap check manualmente para 14:00 del 3 julio
    const date = '2026-07-03';
    const time = '14:00';
    const duration = 45;
    
    const [appts] = await c.execute(
        "SELECT appointment_time, duration_minutes FROM appointments WHERE appointment_date=? AND status!='cancelled'", [date]
    );
    console.log("=== Appointments on", date, "===");
    
    const pt = (t) => { if (!t) return [0,0]; const [h,m]=t.toString().split(':').map(Number); return [h,m]; };
    const mt = (h, m) => new Date(`${date}T${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:00-05:00`).getTime();
    
    const [reqH, reqM] = time.split(':').map(Number);
    const reqStart = mt(reqH, reqM);
    const reqEnd = reqStart + (duration * 60 * 1000);
    console.log(`Request: ${time} -> ${new Date(reqStart).toISOString()} to ${new Date(reqEnd).toISOString()}`);
    
    for (const a of appts) {
        const [h, m] = pt(a.appointment_time);
        const apptStart = mt(h, m);
        const apptEnd = apptStart + (a.duration_minutes * 60 * 1000);
        const overlap = (reqStart < apptEnd && reqEnd > apptStart);
        console.log(`${a.appointment_time} (${a.duration_minutes}min): ${new Date(apptStart).toISOString()}-${new Date(apptEnd).toISOString()} | Overlap: ${overlap}`);
    }
    
    // Also check cancelled appointments that might have huge durations
    const [cancelled] = await c.execute(
        "SELECT id,patient_name,appointment_date,appointment_time,duration_minutes,status FROM appointments WHERE duration_minutes > 120"
    );
    console.log("\n=== Appointments with duration > 120 min ===");
    console.table(cancelled);
    
    await c.end();
})();
