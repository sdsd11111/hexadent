var mysql = require('mysql2/promise');
mysql.createConnection({
    host: 'mysql.us.stackcp.com',
    port: 43192,
    user: 'pdfs-texto-3139329864',
    password: '9f4j6r1lml',
    database: 'pdfs-texto-3139329864'
}).then(function(conn) {
    console.log('Resetando...');
    return conn.execute("UPDATE appointments SET status = '', reminder_sent = 0 WHERE id = 127");
}).then(function() {
    console.log('✓ Reset done');
    process.exit(0);
}).catch(function(err) {
    console.error(err.message);
    process.exit(1);
});