const fs = require('fs');
const mysql = require('mysql2/promise');

if (fs.existsSync('.env')) {
    const lines = fs.readFileSync('.env', 'utf8').split('\n');
    lines.forEach(line => {
        const [key, ...vals] = line.split('=');
        if (key && vals && !key.trim().startsWith('#')) {
            process.env[key.trim()] = vals.join('=').trim().replace(/^"|"$/g, '');
        }
    });
}

async function runTests() {
    let results = "--- HARDENING VERIFICATION RESULTS ---\n";
    console.log("Starting tests...");

    try {
        const { processChatbotMessage } = await import('./lib/chatbot/logic.js');
        const { validateCedula } = await import('./lib/chatbot/utils/validation.js');

        // 1. Cédula Validation
        results += "\n🔹 Cédula Validation:\n";
        [
            { id: "1111111111", expect: false },
            { id: "1710034065", expect: true }, // Known valid
            { id: "1724018371", expect: false },
            { id: "0999999999", expect: false }
        ].forEach(t => {
            const ok = validateCedula(t.id);
            results += `   ID ${t.id} -> ${ok ? 'VALID' : 'INVALID'} (Expected: ${t.expect ? 'VALID' : 'INVALID'})\n`;
        });

        // 2. Database Checks
        const dbConfig = {
            host: process.env.MYSQL_HOST,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DATABASE,
        };
        const c = await mysql.createConnection(dbConfig);

        // 3. Slot Locking
        results += "\n🔹 Slot Locking:\n";
        const testPhone = "998877665";
        await c.execute("DELETE FROM chatbot_locked_slots WHERE locked_by = ?", [testPhone]);

        await processChatbotMessage(testPhone, "Cita para limpieza mañana a las 09:00");
        const [locks] = await c.execute("SELECT * FROM chatbot_locked_slots WHERE locked_by = ?", [testPhone]);
        results += locks.length > 0 ? `   ✅ Slot Locked: ${locks[0].date} ${locks[0].time}\n` : "   ❌ Slot Lock FAILED\n";

        // 4. Flow Validation
        results += "\n🔹 Flow Validation (Invalid Cédula):\n";
        await processChatbotMessage(testPhone, "Mi cédula es 1111111111 y tengo 25 años");
        const [logs] = await c.execute("SELECT bot_resp FROM chatbot_logs WHERE phone = ? ORDER BY id DESC LIMIT 1", [testPhone]);
        results += logs[0].bot_resp.includes("no es válida") ? "   ✅ Bot Rejected Invalid ID\n" : `   ❌ Rejection FAILED. Response: ${logs[0].bot_resp}\n`;

        await c.end();

    } catch (e) {
        results += `\nFATAL ERROR: ${e.message}\n`;
    }

    fs.writeFileSync('hardening_test_results.txt', results);
    console.log("Results written to hardening_test_results.txt");
    process.exit(0);
}

runTests();
