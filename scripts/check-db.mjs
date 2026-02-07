import pool from '../lib/db.js';
import dotenv from 'dotenv';
dotenv.config();

async function checkTables() {
    try {
        const [rows] = await pool.query('SHOW TABLES');
        console.log('Tables in database:', JSON.stringify(rows, null, 2));
        pool.end();
    } catch (err) {
        console.error('Error connecting to DB:', err);
    }
}

checkTables();
