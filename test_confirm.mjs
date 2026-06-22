// Test script to simulate Luis Cuenca sending "SI"
import processChatbotMessage from './lib/chatbot/logic.js';

async function test() {
    const phoneNumber = '593986426900'; // Luis Cuenca
    const message = 'Si'; // Same as what Luis sent
    
    console.log(`[TEST] Simulating message "${message}" from ${phoneNumber}`);
    console.log('---');
    
    try {
        const result = await processChatbotMessage(phoneNumber, message);
        console.log('\n[TEST RESULT]');
        console.log(result);
    } catch (e) {
        console.error('[TEST ERROR]', e.message);
    }
}

test();