const mysql = require('mysql2/promise');
const fs = require('fs');

async function run() {
    let env = {};
    if (fs.existsSync('.env')) {
        fs.readFileSync('.env', 'utf8').split('\n').filter(Boolean).forEach(l => {
            const [k, v] = l.split('=');
            if (k && v && !k.startsWith('#')) env[k.trim()] = v.trim();
        });
    }

    const config = {
        host: env.MYSQL_HOST,
        port: env.MYSQL_PORT,
        user: env.MYSQL_USER,
        password: env.MYSQL_PASSWORD,
        database: env.MYSQL_DATABASE,
    };

    let connection;
    try {
        connection = await mysql.createConnection(config);
        console.log('--- Database Hardening ---');

        // 1. Check if index exists
        const [rows] = await connection.execute(
            "SHOW INDEX FROM appointments WHERE Key_name = 'idx_slot'"
        );

        if (rows.length > 0) {
            console.log('ℹ️ Index idx_slot already exists.');
        } else {
            console.log('🔒 Adding UNIQUE INDEX idx_slot...');
            await connection.execute(
                'ALTER TABLE appointments ADD UNIQUE INDEX idx_slot (appointment_date, appointment_time)'
            );
            console.log('✅ Index added successfully.');
        }

    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            console.error('⚠️ Could not add unique index because duplicate appointments already exist.');
            console.error('ACTION REQUIRED: You must manually delete duplicate slots before applying this fix.');
        } else {
            console.error('❌ Error:', err.message);
        }
    } finally {
        if (connection) await connection.end();
    }
}
run();
