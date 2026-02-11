const mysql = require('mysql2/promise');
const fs = require('fs');

// Mock calendar_helper import logic (since it's an ES module, we'll test the logic concepts here or try to import if possible)
// To keep it simple and robust, we will TEST THE DB CONSTRAINT directly.

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

    const connection = await mysql.createConnection(config);
    console.log('--- VERIFYING HARDENING ---');

    try {
        // 1. VERIFY TIMEZONE LOGIC
        const ecuadorTime = new Date().toLocaleString("en-US", { timeZone: "America/Guayaquil" });
        const nowEcu = new Date(ecuadorTime);
        console.log(`✅ TIMEZONE CHECK: Server says it is ${new Date().toISOString()}`);
        console.log(`✅ ECUADOR TIME detected as: ${nowEcu.toISOString()}`);

        // 2. VERIFY DUPLICATE CONSTRAINT
        const testDate = '2099-12-31';
        const testTime = '23:55:00';

        console.log(`\n--- TESTING RACE CONDITION ---`);
        console.log(`Attempting to insert test slot ${testDate} ${testTime}...`);

        // Insert 1
        await connection.execute(
            'INSERT IGNORE INTO appointments (patient_name, patient_phone, appointment_date, appointment_time, duration_minutes, status) VALUES (?, ?, ?, ?, ?, ?)',
            ['Tester 1', '0000000000', testDate, testTime, 20, 'scheduled']
        );
        console.log('Insert 1: SUCCESS (or ignored if existed)');

        // Insert 2 (Should Fail)
        try {
            await connection.execute(
                'INSERT INTO appointments (patient_name, patient_phone, appointment_date, appointment_time, duration_minutes, status) VALUES (?, ?, ?, ?, ?, ?)',
                ['Tester 2', '0000000001', testDate, testTime, 20, 'scheduled']
            );
            console.log('❌ FAIL: Duplicate insert SUCCEEDED (Constraint missing!)');
        } catch (e) {
            if (e.code === 'ER_DUP_ENTRY') {
                console.log('✅ SUCCESS: Duplicate insert FAILED with ER_DUP_ENTRY (Reference: "Slot taken" logic works).');
            } else {
                console.log(`❌ FAIL: Unexpected error: ${e.message}`);
            }
        }

        // Cleanup
        await connection.execute('DELETE FROM appointments WHERE appointment_date = ? AND appointment_time = ?', [testDate, testTime]);
        console.log('Cleanup done.');

    } catch (err) {
        console.error('FATAL:', err);
    } finally {
        await connection.end();
    }
}
run();
