
import 'dotenv/config';
import { processChatbotMessage, ensureTables } from './lib/chatbot/logic.js';
import db from './lib/db.js';

async function testScenario(name, phone, message) {
    console.log(`\n--- TEST: ${name} ---`);
    console.log(`User: ${message}`);
    // We log inside logic.js, so we'll see the results in console
    await processChatbotMessage(phone, message);
}

async function runVerification() {
    await ensureTables();

    const testPhone = "593999999999";

    // Clear test data
    await db.execute('DELETE FROM handoff_sessions WHERE phone = ?', [testPhone]);

    console.log("Starting Verification of All Rules...");

    // 1. Check Pediatric Logic (Should see "Nombre del niño" in internal dataReq console log)
    await testScenario("Pediatric Exception", testPhone, "Cita para mi hijo de 5 años para mañana a las 9am");

    // 2. Check Prosthesis Logic (Should force adult context)
    await testScenario("Prosthesis Logic", testPhone, "Necesito una placa dental o prótesis");

    // 3. Check Handoff Logic
    await testScenario("Handoff Trigger", testPhone, "Quiero hablar con la doctora personalmente");

    // 4. Check Invoice Flow
    await testScenario("Invoice Flow Start", testPhone, "Necesito factura");
    await testScenario("Invoice Data Entry", testPhone, "Mi nombre es Juan, RUC 1104, Dir Centro, correo juan@test.com");

    // 5. Check Surgery/Third Molar Logic
    await testScenario("Surgery Booking", testPhone, "Quiero sacarme la muela del juicio");
    await testScenario("Surgery Cost Inquiry", testPhone, "Cuanto cuesta sacarse una muela del juicio");

    // Check if handoff is active
    const [handoff] = await db.execute('SELECT id FROM handoff_sessions WHERE phone = ?', [testPhone]);
    console.log(`\nRESULT: Handoff Session Count for ${testPhone}: ${handoff.length} (Expected: 1)`);

    console.log("\nVerification complete.");
    process.exit(0);
}

runVerification().catch(e => {
    console.error("Verification failed:", e);
    process.exit(1);
});
