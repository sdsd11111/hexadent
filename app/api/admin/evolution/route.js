import { NextResponse } from 'next/server';
import axios from 'axios';

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL;
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY;
const EVOLUTION_INSTANCE = process.env.EVOLUTION_INSTANCE;

/**
 * CRITICAL FIX: Separate STATUS CHECK from QR RETRIEVAL.
 * 
 * The root cause of "No se pudo vincular" was:
 *   - Every poll called /instance/connect/ which generates a NEW QR
 *   - The new QR invalidates the old one the user is scanning
 *   - By the time the phone connects, the QR is already dead
 * 
 * Solution:
 *   - GET (default): ONLY checks /instance/connectionState/ — never touches /instance/connect/
 *   - GET ?action=qr: Explicitly requests a fresh QR via /instance/connect/
 *   - The frontend polls status frequently but ONLY requests QR once
 */

export async function GET(request) {
    try {
        if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY || !EVOLUTION_INSTANCE) {
            return NextResponse.json({ error: 'Configuración de Evolution API incompleta' }, { status: 500 });
        }

        const { searchParams } = new URL(request.url);
        const action = searchParams.get('action');

        // --- ACTION: Fetch a NEW QR code (only when user explicitly requests it) ---
        if (action === 'qr') {
            try {
                const qrUrl = `${EVOLUTION_API_URL}/instance/connect/${EVOLUTION_INSTANCE}`;
                console.log("[Evolution] Requesting NEW QR from:", qrUrl);
                const qrRes = await axios.get(qrUrl, {
                    headers: { 'apikey': EVOLUTION_API_KEY },
                    timeout: 15000
                });
                const resData = qrRes.data;
                const qrData = resData.base64 || resData.qrcode || resData.data?.base64 || resData.data?.qrcode || null;

                console.log("[Evolution] QR response keys:", Object.keys(resData), "| QR found:", !!qrData);

                return NextResponse.json({
                    instance: EVOLUTION_INSTANCE,
                    status: 'waiting_scan',
                    qr: qrData
                });
            } catch (e) {
                console.error("[Evolution] QR Fetch Error:", e.response?.data || e.message);
                return NextResponse.json({
                    instance: EVOLUTION_INSTANCE,
                    status: 'error',
                    qr: null,
                    error: e.message
                });
            }
        }

        // --- DEFAULT: Only check connection status (NEVER generates a new QR) ---
        const statusUrl = `${EVOLUTION_API_URL}/instance/connectionState/${EVOLUTION_INSTANCE}`;
        let connectionStatus = 'unknown';
        let instanceExists = true;

        try {
            const statusRes = await axios.get(statusUrl, {
                headers: { 'apikey': EVOLUTION_API_KEY },
                timeout: 10000
            });
            connectionStatus = statusRes.data?.instance?.state || statusRes.data?.state || statusRes.data?.status || 'unknown';
            console.log("[Evolution] Status check:", connectionStatus);
        } catch (e) {
            if (e.response?.status === 404) {
                instanceExists = false;
                connectionStatus = 'not_found';
                console.log("[Evolution] Instance not found (404)");
            } else {
                console.error("[Evolution] Status check error:", e.message);
                connectionStatus = 'error';
            }
        }

        // If instance doesn't exist, create it silently
        if (!instanceExists) {
            try {
                console.log("[Evolution] Creating instance:", EVOLUTION_INSTANCE);
                await axios.post(`${EVOLUTION_API_URL}/instance/create`, {
                    instanceName: EVOLUTION_INSTANCE,
                    token: EVOLUTION_API_KEY,
                    qrcode: true,
                    number: ""
                }, {
                    headers: { 'apikey': EVOLUTION_API_KEY },
                    timeout: 15000
                });
                connectionStatus = 'created';
            } catch (createErr) {
                console.error("[Evolution] Create Error:", createErr.response?.data || createErr.message);
            }
        }

        return NextResponse.json({
            instance: EVOLUTION_INSTANCE,
            status: connectionStatus
        });

    } catch (error) {
        console.error("[Evolution] Internal Error:", error.message);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

/**
 * Handle instance actions (logout, restart, delete, full_reset)
 */
export async function POST(request) {
    try {
        const { action } = await request.json();
        const headers = { 'apikey': EVOLUTION_API_KEY };

        if (action === 'logout') {
            await axios.delete(`${EVOLUTION_API_URL}/instance/logout/${EVOLUTION_INSTANCE}`, { headers });
            return NextResponse.json({ success: true });
        }

        if (action === 'delete') {
            await axios.delete(`${EVOLUTION_API_URL}/instance/delete/${EVOLUTION_INSTANCE}`, { headers });
            return NextResponse.json({ success: true });
        }

        if (action === 'restart') {
            await axios.post(`${EVOLUTION_API_URL}/instance/restart/${EVOLUTION_INSTANCE}`, {}, { headers });
            return NextResponse.json({ success: true });
        }

        // Full reset: delete -> wait -> create -> wait -> return
        if (action === 'full_reset') {
            console.log("[Evolution] FULL RESET: Deleting instance...");
            try {
                await axios.delete(`${EVOLUTION_API_URL}/instance/delete/${EVOLUTION_INSTANCE}`, { headers });
            } catch (e) {
                console.log("[Evolution] Delete failed (might not exist):", e.message);
            }

            // Wait for deletion to propagate
            await new Promise(r => setTimeout(r, 3000));

            console.log("[Evolution] FULL RESET: Creating fresh instance...");
            try {
                await axios.post(`${EVOLUTION_API_URL}/instance/create`, {
                    instanceName: EVOLUTION_INSTANCE,
                    token: EVOLUTION_API_KEY,
                    qrcode: true,
                    number: ""
                }, { headers });
            } catch (e) {
                console.error("[Evolution] Create after reset error:", e.response?.data || e.message);
            }

            // Wait for creation to settle
            await new Promise(r => setTimeout(r, 2000));

            return NextResponse.json({ success: true, message: 'Instance reset complete' });
        }

        return NextResponse.json({ error: 'Acción no válida' }, { status: 400 });
    } catch (error) {
        console.error("[Evolution] POST Error:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
