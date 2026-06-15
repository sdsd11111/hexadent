import fs from 'fs';
import path from 'path';

// Load Env
const envPath = path.join(process.cwd(), '.env');
const env = fs.readFileSync(envPath, 'utf8').split('\n').reduce((acc, line) => {
    const [key, ...val] = line.split('=');
    if (key && val.length > 0) acc[key.trim()] = val.join('=').trim().replace(/^['"]|['"]$/g, '');
    return acc;
}, {});

for (const k in env) {
    process.env[k] = env[k];
}

// Now import database and sessions
const { getSession, saveSession, ensureSessionTable } = await import('../lib/chatbot/sessions.js');
const db = (await import('../lib/db.js')).default;

async function testTimeNormalization() {
    await ensureSessionTable();
    const testPhone = '1234567890';
    
    // Clean old session
    await db.execute('DELETE FROM chatbot_sessions WHERE phone = ?', [testPhone]);
    
    // Save a session with target_time
    const mockData = {
        name: 'Test Patient',
        target_date: '2026-06-15',
        target_time: '14:00',
        duration: 45,
        current_flow: 'Nuevo',
        metadata: { test: true }
    };
    
    console.log('1. Saving session with target_time = "14:00"...');
    await saveSession(testPhone, mockData);
    
    console.log('2. Retrieving session from DB...');
    const session = await getSession(testPhone);
    console.log('Retrieved target_time:', session.target_time, `(Type: ${typeof session.target_time})`);
    
    if (session.target_time === '14:00') {
        console.log('✅ Success: Time normalized correctly to "14:00"');
    } else {
        console.log('❌ Failure: Time is', session.target_time);
    }
    
    // Clean up
    await db.execute('DELETE FROM chatbot_sessions WHERE phone = ?', [testPhone]);
}

function testNameOverrideRegex() {
    const forbiddenWords = ['favor', 'por', 'gracias', 'ayuda', 'ayudeme', 'hola', 'buenos', 'dias', 'tardes', 'noches', 'quiero', 'cita', 'agendar', 'turno', 'hora', 'mas', 'tarde', 'temprano', 'adelantar', 'reagendar', 'cancelar', 'confirmar', 'doctora', 'doc', 'doctorita', 'esta', 'este', 'para', 'como', 'con', 'gusto', 'si', 'no'];
    
    function userMessageLooksLikeName(messageText) {
        const normalizedMsgForNameCheck = messageText.toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, ""); // Remove accents/diacritics
        const hasForbiddenWord = forbiddenWords.some(word => {
            const regex = new RegExp(`\\b${word}\\b`, 'i');
            return regex.test(normalizedMsgForNameCheck);
        });
        return messageText.match(/^[a-zA-ZáéíóúñÑ\s]{5,40}$/) && 
               messageText.split(/\s+/).length >= 2 &&
               !messageText.match(/\d{5,}/) &&
               !hasForbiddenWord;
    }

    const testCases = [
        { text: 'Ayúdeme por favor', expected: false },
        { text: 'hola, ayúdame', expected: false },
        { text: 'Juan Perez', expected: true },
        { text: 'Maria Del Carmen', expected: true },
        { text: 'mañana por favor', expected: false },
        { text: 'sí por favor', expected: false },
        { text: 'gracias doctora', expected: false },
        { text: 'buenos días doc', expected: false }
    ];

    console.log('\n--- Testing Name Override Regex with Normalization ---');
    for (const tc of testCases) {
        const result = !!userMessageLooksLikeName(tc.text);
        console.log(`Text: "${tc.text}" | Expected: ${tc.expected} | Result: ${result} | ${result === tc.expected ? '✅ Pass' : '❌ Fail'}`);
    }
}

async function run() {
    try {
        await testTimeNormalization();
    } catch (e) {
        console.error('Time Normalization Test Error:', e);
    }
    testNameOverrideRegex();
    process.exit(0);
}

run();
