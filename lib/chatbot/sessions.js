import db from '../db';

/**
 * Ensures the chatbot_sessions table exists.
 */
export async function ensureSessionTable() {
    try {
        await db.execute(`
            CREATE TABLE IF NOT EXISTS chatbot_sessions (
                phone VARCHAR(50) PRIMARY KEY,
                name VARCHAR(255),
                cedula VARCHAR(50),
                age INT,
                current_flow TEXT,
                metadata JSON,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);
    } catch (error) {
        console.error("[Session Manager] Error creating table:", error.message);
    }
}

/**
 * Retrieves session data for a specific phone number.
 */
export async function getSession(phone) {
    const cleanPhone = phone.replace(/\D/g, '');
    try {
        const [rows] = await db.execute(
            'SELECT name, cedula, age, current_flow, metadata FROM chatbot_sessions WHERE phone = ?',
            [cleanPhone]
        );
        if (rows[0] && rows[0].metadata) {
            try {
                rows[0].metadata = JSON.parse(rows[0].metadata);
            } catch (e) {
                rows[0].metadata = null;
            }
        }
        return rows[0] || null;
    } catch (error) {
        console.error(`[Session Manager] Error fetching session for ${cleanPhone}:`, error.message);
        return null;
    }
}

/**
 * Saves or updates session data.
 */
export async function saveSession(phone, data) {
    const cleanPhone = phone.replace(/\D/g, '');
    const { name, cedula, age, current_flow, metadata } = data;
    const metadataStr = metadata ? JSON.stringify(metadata) : null;
    try {
        await db.execute(`
            INSERT INTO chatbot_sessions (phone, name, cedula, age, current_flow, metadata) 
            VALUES (?, ?, ?, ?, ?, ?) 
            ON DUPLICATE KEY UPDATE 
                name = COALESCE(VALUES(name), name), 
                cedula = COALESCE(VALUES(cedula), cedula),
                age = COALESCE(VALUES(age), age),
                current_flow = VALUES(current_flow),
                metadata = VALUES(metadata)
        `, [cleanPhone, name, cedula, age, current_flow, metadataStr]);
        console.log(`[Session Manager] Saved data for ${cleanPhone}`);
    } catch (error) {
        console.error(`[Session Manager] Error saving session for ${cleanPhone}:`, error.message);
    }
}
