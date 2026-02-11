
const mysql = require('mysql2/promise');

async function run() {
    const config = {
        host: 'mysql.us.stackcp.com',
        port: 42000,
        user: 'videosyfotos-3531303063df',
        password: 'q09k96yccm',
        database: 'videosyfotos-3531303063df',
    };
    try {
        const connection = await mysql.createConnection(config);
        console.log('Creating media_upload_chunks table...');
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS media_upload_chunks (
                id INT AUTO_INCREMENT PRIMARY KEY,
                upload_id VARCHAR(50) NOT NULL,
                chunk_index INT NOT NULL,
                data LONGBLOB NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_upload (upload_id)
            )
        `);
        console.log('✓ Table created or already exists');
        await connection.end();
    } catch (err) {
        console.error('✗ ERROR:', err.message);
    }
}
run();
