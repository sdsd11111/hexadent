var mysql = require('mysql2/promise');
mysql.createConnection({
    host: 'mysql.us.stackcp.com',
    port: 39908,
    user: 'odontologa-35303936dec6',
    password: 'dhoy9qbzlu',
    database: 'odontologa-35303936dec6'
}).then(function(conn) {
    return conn.execute('SELECT id, patient_phone, appointment_date, appointment_time, status, reminder_sent FROM appointments ORDER BY id DESC LIMIT 10');
}).then(function(result) {
    console.log(JSON.stringify(result[0], null, 2));
    process.exit(0);
}).catch(function(err) {
    console.error(err.message);
    process.exit(1);
});