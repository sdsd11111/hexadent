var mysql = require('mysql2/promise');
mysql.createConnection({
    host: 'mysql.us.stackcp.com',
    port: 43192,
    user: 'pdfs-texto-3139329864',
    password: '9f4j6r1lml',
    database: 'pdfs-texto-3139329864'
}).then(function(conn) {
    console.log('Resetando status y reminder_sent para ID 127...');
    return conn.execute('UPDATE appointments SET status = "", reminder_sent = 0 WHERE id = 127');
}).then(function(result) {
    console.log('✓ Reset done');
    return conn.execute('SELECT id, status, reminder_sent FROM appointments WHERE id = 127');
}).then(function(result) {
    console.log('Estado:', result[0]);
    process.exit(0);
}).catch(function(err) {
    console.error('Error:', err.message);
    process.exit(1);
});