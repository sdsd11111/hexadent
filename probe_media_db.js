
const mysql = require('mysql2/promise');

async function probe() {
    const config = {
        host: 'mysql.us.stackcp.com',
        port: 42000,
        user: 'videosyfotos-3531303063df',
        password: 'q09k96yccm',
        database: 'videosyfotos-3531303063df',
    };

    try {
        const connection = await mysql.createConnection(config);
        const [rows] = await connection.execute("SHOW VARIABLES LIKE 'max_allowed_packet'");
        console.log('max_allowed_packet:', rows[0].Value);
        await connection.end();
    } catch (err) {
        console.error('✗ PROBE FAILED:', err.message);
    }
}

probe();
