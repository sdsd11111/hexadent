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
                target_date DATE,
                target_time TIME,
                duration INT,
                current_flow TEXT,
                metadata JSON,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

        // ALTER TABLE safety: Check for missing columns in existing tables
        const [columns] = await db.execute('DESCRIBE chatbot_sessions');
        const colNames = columns.map(c => c.Field);

        const updates = [
            { name: 'age', type: 'INT' },
            { name: 'target_date', type: 'DATE' },
            { name: 'target_time', type: 'TIME' },
            { name: 'duration', type: 'INT DEFAULT 20' },
            { name: 'current_flow', type: 'TEXT' },
            { name: 'metadata', type: 'JSON' }
        ];

        for (const col of updates) {
            if (!colNames.includes(col.name)) {
                console.log(`[Session Manager] Auto-adding missing column: ${col.name}`);
                await db.execute(`ALTER TABLE chatbot_sessions ADD COLUMN ${col.name} ${col.type}`);
            }
        }

    } catch (error) {
        console.error("[Session Manager] Error ensuring/syncing table:", error.message);
    }
}

/**
 * Retrieves session data for a specific phone number.
 */
export async function getSession(phone) {
    const cleanPhone = phone.replace(/\D/g, '');
    try {
        const [rows] = await db.execute(
            'SELECT name, cedula, age, target_date, target_time, duration, current_flow, metadata FROM chatbot_sessions WHERE phone = ?',
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
    const { name, cedula, age, target_date, target_time, duration, current_flow, metadata } = data;
    const metadataStr = metadata ? JSON.stringify(metadata) : null;
    try {
        await db.execute(`
            INSERT INTO chatbot_sessions (phone, name, cedula, age, target_date, target_time, duration, current_flow, metadata) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) 
            ON DUPLICATE KEY UPDATE 
                name = COALESCE(VALUES(name), name), 
                cedula = COALESCE(VALUES(cedula), cedula),
                age = COALESCE(VALUES(age), age),
                target_date = COALESCE(VALUES(target_date), target_date),
                target_time = COALESCE(VALUES(target_time), target_time),
                duration = COALESCE(VALUES(duration), duration),
                current_flow = VALUES(current_flow),
                metadata = VALUES(metadata)
        `, [cleanPhone, name, cedula, age, target_date, target_time, duration, current_flow, metadataStr]);
        console.log(`[Session Manager] Saved data for ${cleanPhone}`);
    } catch (error) {
        console.error(`[Session Manager] Error saving session for ${cleanPhone}:`, error.message);
    }
}
