const mysql = require('mysql2/promise');
require('dotenv').config();

async function testConnection() {
    console.log("Attempting to connect to:", process.env.MYSQL_HOST);
    console.log("User:", process.env.MYSQL_USER);
    console.log("Port:", process.env.MYSQL_PORT);

    try {
        const connection = await mysql.createConnection({
            host: process.env.MYSQL_HOST,
            port: process.env.MYSQL_PORT,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DATABASE,
            connectTimeout: 10000
        });

        console.log("✅ Success! Connected to the database.");

        const query = "ALTER TABLE handoff_sessions ADD COLUMN expires_at TIMESTAMP NULL AFTER phone";
        console.log("Executing:", query);

        try {
            await connection.execute(query);
            console.log("✅ Column 'expires_at' added successfully.");
        } catch (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log("ℹ️ Column 'expires_at' already exists.");
            } else {
                console.error("❌ Error executing query:", err.message);
            }
        }

        await connection.end();
    } catch (err) {
        console.error("❌ Connection FAILED:", err.message);
        if (err.code === 'ECONNREFUSED') {
            console.log("\n--- EXPLANATION ---");
            console.log("The error 'ECONNREFUSED' usually means the database server at " + process.env.MYSQL_HOST + " is rejecting connections from outside its own network.");
            console.log("This is common in providers like StackCP, where you must whitelist the IP address of the machine trying to connect, or use their internal hosting panel.");
        }
    }
}

testConnection();
