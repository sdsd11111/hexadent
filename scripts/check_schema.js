var mysql = require('mysql2/promise');
mysql.createConnection({
    host: 'mysql.us.stackcp.com',
    port: 43192,
    user: 'pdfs-texto-3139329864',
    password: '9f4j6r1lml',
    database: 'pdfs-texto-3139329864'
}).then(function(conn) {
    return conn.execute('DESCRIBE appointments');
}).then(function(result) {
    console.log('Columnas de appointments:');
    result[0].forEach(function(col) {
        console.log(col.Field, col.Type, col.Null, col.Key, col.Default);
    });
    process.exit(0);
}).catch(function(err) {
    console.error(err.message);
    process.exit(1);
});