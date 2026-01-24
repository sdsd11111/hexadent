require('dotenv').config();
const mysql = require('mysql2/promise');

async function testConnection() {
    console.log('--- Testing DB Connection ---');
    console.log('Host:', process.env.MYSQL_HOST);
    console.log('User:', process.env.MYSQL_USER);
    console.log('Database:', process.env.MYSQL_DATABASE);

    try {
        const connection = await mysql.createConnection({
            host: process.env.MYSQL_HOST,
            port: process.env.MYSQL_PORT,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DATABASE,
        });
        console.log('✅ Connection Successful!');
        await connection.end();
    } catch (error) {
        console.error('❌ Connection Failed:', error.message);
    }
}

testConnection();
