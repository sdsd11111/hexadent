const mysql = require('mysql2/promise');
const fs = require('fs');

// Mock environment loading
let env = {};
if (fs.existsSync('.env')) {
    fs.readFileSync('.env', 'utf8').split('\n').filter(Boolean).forEach(l => {
        const [k, v] = l.split('=');
        if (k && v && !k.startsWith('#')) env[k.trim()] = v.trim();
    });
    // Inject into process.env for the logic to work
    Object.assign(process.env, env);
}

// We need to import the logic. Since logic.js is ESM, we use dynamic import.
// We also need to mock the sendEvolutionWhatsApp function to capture responses instead of sending them.

async function runTests() {
    console.log("--- STARTING 20-PERSONA STRESS TEST (Fault Tolerant) ---");
    const { processChatbotMessage } = await import('./lib/chatbot/logic.js');

    const dbConfig = {
        host: env.MYSQL_HOST,
        port: env.MYSQL_PORT,
        user: env.MYSQL_USER,
        password: env.MYSQL_PASSWORD,
        database: env.MYSQL_DATABASE,
    };
    const connection = await mysql.createConnection(dbConfig);

    const scenarios = [
        { id: 1, name: "The 'Just Asking' Looper", msgs: ["Precio?", "Donde estan?", "Horario?", "Precio?"] },
        { id: 2, name: "The Profane User", msgs: ["I want a f***ing appointment right now you stupid bot"] },
        { id: 3, name: "The Typo King", msgs: ["Ola kiero sita pa mañana a las tress"] },
        { id: 4, name: "The Saturday Skeptic", msgs: ["Atienden los sabados?", "Quiero cita sabado 2pm"] },
        { id: 5, name: "The Sunday Trespasser", msgs: ["Quiero cita domingo 10am"] },
        { id: 6, name: "The Midnight Owl", msgs: ["Quiero cita hoy a las 3am"] },
        { id: 7, name: "The Past Traveler", msgs: ["Agendame para el dia de ayer"] },
        { id: 8, name: "The 'Full Day' Spammer", msgs: ["Tienes 9am?", "Tienes 10am?", "Tienes 11am?", "Tienes 12pm?"] },
        { id: 9, name: "The Vaguest User", msgs: ["Quiero cita"] },
        { id: 10, name: "The Specificity Freak", msgs: ["Quiero cita exactamente a las 14:03 con 30 segundos"] },
        { id: 11, name: "The 'Change My Mind'", msgs: ["Lunes", "No, Martes", "Mejor Viernes"] },
        { id: 12, name: "The 'Non-Patient'", msgs: ["Venden pizza?"] },
        { id: 13, name: "The Emergency", msgs: ["SE ME CAYO EL DIENTE AYUDA SANGRANDO"] },
        { id: 14, name: "The Ghost (Simulated)", msgs: ["Hola"] }, // Needs wait time simulation, harder to script quickly
        { id: 15, name: "The 'Human' Seeker", msgs: ["Quiero hablar con una persona real"] },
        { id: 16, name: "The Pricing Haggle", msgs: ["Muy caro, dame descuento"] },
        { id: 17, name: "The 'Already Booked'", msgs: ["Tengo cita, cancelala"] },
        { id: 18, name: "The SQL Injector", msgs: ["Me llamo '); DROP TABLE appointments; --"] },
        { id: 19, name: "The Long Text", msgs: ["Lorem ipsum dolor sit amet ".repeat(50)] },
        { id: 20, name: "The 'Wrong Number'", msgs: ["Es la peluqueria de Maria?"] }
    ];

    let resultsLog = "";

    for (const scenario of scenarios) {
        console.log(`\n🔹 TESTING: ${scenario.name}`);
        resultsLog += `\n=== [${scenario.id}] ${scenario.name} ===\n`;

        const testPhone = `TEST_USER_${scenario.id}`;

        // Clear previous session for this test user
        await connection.execute("DELETE FROM chatbot_sessions WHERE phone = ?", [testPhone]);
        await connection.execute("DELETE FROM chatbot_logs WHERE phone = ?", [testPhone]);

        for (const msg of scenario.msgs) {
            console.log(`   User says: "${msg}"`);
            resultsLog += `User: "${msg}"\n`;

            try {
                // Execute logic
                await processChatbotMessage(testPhone, msg);
            } catch (e) {
                // Ignore API errors, we just want the logs
                // console.log(`   (Ignored API Error: ${e.message})`);
            }

            // Fetch the response from DB logs to see what the bot actually said
            // We wait a bit for async write
            await new Promise(r => setTimeout(r, 1000));

            // MATCH LOGIC: Logic cleans phone numbers, so we must query by clean number
            const cleanTestPhone = testPhone.replace(/\D/g, '');
            console.log(`   (Debug) Check logs for cleanPhone: '${cleanTestPhone}'`);

            // Debug: Check total logs
            const [total] = await connection.execute("SELECT COUNT(*) as c FROM chatbot_logs");
            console.log(`   (Debug) Total logs in DB: ${total[0].c}`);

            const [rows] = await connection.execute(
                "SELECT bot_resp, user_msg, phone FROM chatbot_logs WHERE phone = ? ORDER BY id DESC LIMIT 1",
                [cleanTestPhone]
            );

            if (rows.length > 0) {
                const response = rows[0].bot_resp;
                console.log(`   Bot says: "${response.substring(0, 100).replace(/\n/g, ' ')}..."`);
                resultsLog += `Bot:  "${response}"\n`;
            } else {
                console.log(`   Bot says: [NO RESPONSE LOGGED]`);
                resultsLog += `Bot:  [NO RESPONSE LOGGED]\n`;
            }
        }
    }

    fs.writeFileSync('stress_test_results.txt', resultsLog);
    console.log("\n✅ TESTS COMPLETED. Results written to stress_test_results.txt");
    await connection.end();
    process.exit(0);
}

runTests();
