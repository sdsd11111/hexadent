var mysql = require('mysql2/promise');
mysql.createConnection({
    host: 'mysql.us.stackcp.com',
    port: 43192,
    user: 'pdfs-texto-3139329864',
    password: '9f4j6r1lml',
    database: 'pdfs-texto-3139329864'
}).then(function(conn) {
    return conn.execute('SELECT id, patient_phone, appointment_date, appointment_time, status, reminder_sent FROM appointments WHERE appointment_date LIKE "%2026-06-22%" ORDER BY appointment_time');
}).then(function(result) {
    console.log('Citas para 22 de junio:');
    console.log(JSON.stringify(result[0], null, 2));
    process.exit(0);
}).catch(function(err) {
    console.error(err.message);
    process.exit(1);
});