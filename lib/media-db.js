import mysql from 'mysql2/promise';

const mediaPool = mysql.createPool({
    host: process.env.MEDIA_MYSQL_HOST,
    port: process.env.MEDIA_MYSQL_PORT,
    user: process.env.MEDIA_MYSQL_USER,
    password: process.env.MEDIA_MYSQL_PASSWORD,
    database: process.env.MEDIA_MYSQL_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

export default mediaPool;
