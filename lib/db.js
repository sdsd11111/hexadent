import mysql from 'mysql2/promise';

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    waitForConnections: true,
    connectionLimit: 20, // Increased for concurrency
    queueLimit: 0,
    connectTimeout: 10000, // 10s wait for remote DB
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000
});

export default pool;
