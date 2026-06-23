var mysql = require('mysql2/promise');
mysql.createConnection({
    host: 'mysql.us.stackcp.com',
    port: 43192,
    user: 'pdfs-texto-3139329864',
    password: '9f4j6r1lml',
    database: 'pdfs-texto-3139329864'
}).then(function(conn) {
    console.log('Agregando completed al ENUM...');
    return conn.execute("ALTER TABLE appointments MODIFY COLUMN status ENUM('scheduled','completed','cancelled') DEFAULT 'scheduled'");
}).then(function(result) {
    console.log('✓ ENUM actualizado');
    return conn.execute('SELECT id, status FROM appointments WHERE id = 127');
}).then(function(result) {
    console.log('Estado actual:', result[0]);
    process.exit(0);
}).catch(function(err) {
    console.error('Error:', err.message);
    process.exit(1);
});