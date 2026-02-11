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
    console.log("--- PERSONALIZATION VERIFICATION ---");
    const { processChatbotMessage } = await import('./lib/chatbot/logic.js');

    const dbConfig = {
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
    };
    const c = await mysql.createConnection(dbConfig);

    const testPhone = "593987654321";
    const testName = "Sol Ruiz";

    // 1. Manually set a name in the session
    console.log(`Setting name ${testName} for ${testPhone}...`);
    await c.execute(
        'INSERT INTO chatbot_sessions (phone, name, current_flow) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE name = VALUES(name)',
        [testPhone, testName, 'Agendado']
    );

    // 2. Call the chatbot logic with a simple greeting
    console.log("Sending 'hola' to the bot...");
    await processChatbotMessage(testPhone, "hola");

    // 3. Check logs for the response
    const [rows] = await c.execute(
        'SELECT bot_resp FROM chatbot_logs WHERE phone = ? ORDER BY id DESC LIMIT 1',
        [testPhone]
    );

    const botResp = rows[0].bot_resp;
    console.log(`Bot Response: "${botResp}"`);

    if (botResp.includes(testName)) {
        console.log("✅ SUCCESS: Bot greeted the user by name!");
    } else {
        console.log("❌ FAILURE: Bot did NOT use the user's name.");
    }

    await c.end();
    console.log("\n--- VERIFICATION FINISHED ---");
    process.exit(0);
}

runTests().catch(console.error);
