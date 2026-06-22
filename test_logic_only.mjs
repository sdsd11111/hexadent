// Test script - NO sends WhatsApp, just logs what would happen
import fs from 'fs';
if (fs.existsSync('.env')) {
    const envContent = fs.readFileSync('.env', 'utf8');
    envContent.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) process.env[key.trim()] = value.trim().replace(/^"(.*)"$/, '$1');
    });
}

import db from './lib/db.js';

async function testConfirmation() {
    const phone = '593967491847';
    const message = 'Si';
    
    console.log(`[TEST] Testing confirmation for ${phone} with message: "${message}"`);
    
    try {
        // Check if user has appointment
        const [appts] = await db.execute(
            'SELECT appointment_date, appointment_time, patient_name, motive, status FROM appointments WHERE patient_phone = ? AND status = "scheduled" AND appointment_date >= CURDATE() ORDER BY appointment_date ASC',
            [phone]
        );
        
        console.log(`\n=== Appointments Found: ${appts.length} ===`);
        console.table(appts);
        
        // Check if message triggers confirmation
        const lowerMsg = message.toLowerCase();
        const isSimpleConfirmation = /^(\s*si\s*|\s*sí\s*|\s*confirmo\s*|\s*ok\s*)$/i.test(lowerMsg);
        
        console.log(`\nIs "Si" a confirmation? ${isSimpleConfirmation}`);
        
        if (isSimpleConfirmation && appts.length > 0) {
            console.log('\n✅ SUCCESS: Bot would send confirmation message!');
            console.log('Expected response: "✅ ¡Su cita está confirmada! 📅 22 de junio a las 13:30"');
        } else if (!isSimpleConfirmation) {
            console.log('\n❌ FAIL: Message not detected as confirmation');
        } else if (appts.length === 0) {
            console.log('\n❌ FAIL: No appointments found');
        }
        
    } catch (e) {
        console.error('Error:', e.message);
    }
    
    process.exit(0);
}

testConfirmation();