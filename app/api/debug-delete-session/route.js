import { NextResponse } from 'next/server';
import db from '../../../lib/db.js';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone') || '593963410409';
    const cleanPhone = phone.replace(/\D/g, '');
    
    try {
        // Delete session
        const [res1] = await db.execute('DELETE FROM chatbot_sessions WHERE phone = ?', [cleanPhone]);
        // Delete logs
        const [res2] = await db.execute('DELETE FROM chatbot_logs WHERE phone = ?', [cleanPhone]);
        // Delete handoff session
        const [res3] = await db.execute('DELETE FROM handoff_sessions WHERE phone = ?', [cleanPhone]);
        // Delete locks
        const [res4] = await db.execute('DELETE FROM chatbot_locks WHERE phone = ?', [cleanPhone]);
        
        return NextResponse.json({
            success: true,
            phone: cleanPhone,
            deleted_sessions: res1.affectedRows,
            deleted_logs: res2.affectedRows,
            deleted_handoffs: res3.affectedRows,
            deleted_locks: res4.affectedRows
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
