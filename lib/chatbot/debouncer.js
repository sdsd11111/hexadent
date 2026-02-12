import { processChatbotMessage, ensureTables } from './logic.js';
import db from '../db.js';

/**
 * Robust Serverless Debouncing:
 * 1. Store message in DB buffer.
 * 2. Try to acquire a lock for this phone number.
 * 3. Only the Lambda that gets the lock waits and processes everything.
 */
export async function debounceMessage(phoneNumber, text, clinicNumber) {
    const cleanPhone = phoneNumber.replace(/\D/g, '');

    try {
        // Ensure tables exist before doing anything
        await ensureTables();

        // 1. Buffer the message
        await db.execute(
            'INSERT INTO chatbot_buffer (phone, message) VALUES (?, ?)',
            [cleanPhone, text]
        );

        // 2. Try to acquire lock
        // DELETE locks older than 30 seconds (stuck locks protection)
        await db.execute('DELETE FROM chatbot_locks WHERE locked_at < NOW() - INTERVAL 30 SECOND');

        const [lockResult] = await db.execute(
            'INSERT IGNORE INTO chatbot_locks (phone) VALUES (?)',
            [cleanPhone]
        );

        // If another Lambda already has the lock, we just exit. 
        // The locking Lambda will pick up our buffered message.
        if (lockResult.affectedRows === 0) {
            console.log(`[Debouncer] Locked for ${cleanPhone}. Adding message to buffer and exiting.`);
            return;
        }

        console.log(`[Debouncer] Lock ACQUIRED for ${cleanPhone}. Waiting 5s to group messages...`);

        // 3. Wait for more messages to arrive in buffer
        await new Promise(resolve => setTimeout(resolve, 5000));

        // 4. Processing Loop: Process everything in buffer until empty while holding the lock
        let hasProcessed = false;
        while (true) {
            const [rows] = await db.execute(
                'SELECT id, message FROM chatbot_buffer WHERE phone = ? ORDER BY id ASC',
                [cleanPhone]
            );

            if (rows.length === 0) break;

            const ids = rows.map(r => r.id);
            const fullMessage = rows.map(r => r.message).join('\n');

            // Clean up the processed IDs from buffer
            await db.execute(`DELETE FROM chatbot_buffer WHERE id IN (${ids.join(',')})`);

            console.log(`[Debouncer] Processing grouped message for ${cleanPhone} (${rows.length} messages): "${fullMessage}"`);
            await processChatbotMessage(phoneNumber, fullMessage, clinicNumber);
            hasProcessed = true;
        }

        // 5. Final clean up of lock
        await db.execute('DELETE FROM chatbot_locks WHERE phone = ?', [cleanPhone]);

    } catch (error) {
        console.error(`[Debouncer] Critical Error for ${cleanPhone}:`, error);
        // Ensure lock release on error
        await db.execute('DELETE FROM chatbot_locks WHERE phone = ?', [cleanPhone]).catch(() => { });
    }
}
