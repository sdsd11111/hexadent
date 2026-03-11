const fs = require('fs');

function loadEnv() {
    if (fs.existsSync('.env')) {
        const lines = fs.readFileSync('.env', 'utf8').split('\n');
        lines.forEach(line => {
            const parts = line.split('=');
            if (parts.length >= 2) {
                const k = parts[0].trim();
                const v = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '').replace(/[\r\n]/g, '');
                if (k && !k.startsWith('#')) {
                    process.env[k] = v;
                }
            }
        });
    }
}

process.env.CHATBOT_TEST_MODE = 'true';

async function run() {
    loadEnv();
    const { processChatbotMessage } = await import('./lib/chatbot/logic.js');

    const patients = [
        { phone: "593991112222", msg: "Hola, agéndame a las 10:15 para mañana. Soy Luis Felipe, mi cédula es 1709876543, para revisión general." },
        { phone: "593993334444", msg: "Quiero una cita el viernes a las 14:30. Ana Gomez, cedula 1722334455, para blanqueamiento." },
        { phone: "593995556666", msg: "Cita para mi hijo el sabado a las 09:00. Representante Mario Vargas." } // Child fallback test
    ];

    console.log(">>> [E2E BOOKING TEST] INICIANDO...");
    for (const p of patients) {
        console.log(`\n--- Test Patient: ${p.phone} ---`);
        console.log(`User says: "${p.msg}"`);
        try {
            const res = await processChatbotMessage(p.phone, p.msg);
            console.log("Bot reply:", res.botResponse || res.bot_response || res);
        } catch (e) {
            console.log("Error:", e.message);
        }
    }
    console.log("\n>>> [FIN] Reservas inyectadas. Revisar DB/Admin.");
    process.exit(0);
}

run();
