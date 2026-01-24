
const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkDb() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.MYSQL_HOST,
            port: process.env.MYSQL_PORT,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DATABASE,
        });

        console.log('Connected to MySQL successfully.');
        const [rows] = await connection.execute('SHOW TABLES');
        console.log('Tables in database:', rows.map(r => Object.values(r)[0]));

        await connection.end();
    } catch (error) {
        console.error('Error connecting to MySQL:', error.message);
    }
}

checkDb();
