import { NextResponse } from 'next/server';
import axios from 'axios';

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL;
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY;
const EVOLUTION_INSTANCE = process.env.EVOLUTION_INSTANCE;
const headers = { 'apikey': EVOLUTION_API_KEY };

/**
 * Helper: get QR from Evolution API (calls /instance/connect/)
 * This is the ONLY place that generates a QR.
 */
async function fetchQrFromEvolution() {
    const qrUrl = `${EVOLUTION_API_URL}/instance/connect/${EVOLUTION_INSTANCE}`;
    console.log("[Evolution] Fetching QR from:", qrUrl);
    const qrRes = await axios.get(qrUrl, { headers, timeout: 15000 });
    const resData = qrRes.data;
    const qr = resData.base64 || resData.qrcode || resData.data?.base64 || resData.data?.qrcode || null;
    console.log("[Evolution] QR keys:", Object.keys(resData), "| Found QR:", !!qr);
    return qr;
}

/**
 * Helper: check connection status (NEVER generates QR)
 */
async function checkConnectionStatus() {
    const statusUrl = `${EVOLUTION_API_URL}/instance/connectionState/${EVOLUTION_INSTANCE}`;
    try {
        const res = await axios.get(statusUrl, { headers, timeout: 10000 });
        const state = res.data?.instance?.state || res.data?.state || res.data?.status || 'unknown';
        console.log("[Evolution] Connection state:", state);
        return { state, exists: true };
    } catch (e) {
        if (e.response?.status === 404) {
            console.log("[Evolution] Instance not found (404)");
            return { state: 'not_found', exists: false };
        }
        console.error("[Evolution] Status error:", e.message);
        return { state: 'error', exists: true };
    }
}

/**
 * Helper: create instance
 */
async function createInstance() {
    console.log("[Evolution] Creating instance:", EVOLUTION_INSTANCE);
    await axios.post(`${EVOLUTION_API_URL}/instance/create`, {
        instanceName: EVOLUTION_INSTANCE,
        token: EVOLUTION_API_KEY,
        qrcode: true,
        number: ""
    }, { headers, timeout: 15000 });

    // Ensure webhook is set so the bot can receive messages
    const hostUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.hexadentdradianarodriguez.com';
    console.log("[Evolution] Configuring webhook for:", hostUrl);
    try {
        await axios.post(`${EVOLUTION_API_URL}/webhook/set/${EVOLUTION_INSTANCE}`, {
            webhook: {
                enabled: true,
                url: `${hostUrl}/api/webhook`,
                events: ['MESSAGES_UPSERT']
            }
        }, { headers, timeout: 10000 });
        console.log("[Evolution] Webhook configured successfully.");
    } catch (e) {
        console.error("[Evolution] Failed to set webhook:", e.message);
    }
}

// ===== GET: Check status OR fetch QR =====
export async function GET(request) {
    try {
        if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY || !EVOLUTION_INSTANCE) {
            return NextResponse.json({ error: 'Config incompleta' }, { status: 500 });
        }

        const { searchParams } = new URL(request.url);
        const action = searchParams.get('action');

        // --- ACTION=qr: Fetch a QR code ---
        if (action === 'qr') {
            // First make sure instance exists
            const { exists } = await checkConnectionStatus();
            if (!exists) {
                try {
                    await createInstance();
                    await new Promise(r => setTimeout(r, 2000));
                } catch (e) {
                    console.error("[Evolution] Auto-create failed:", e.message);
                }
            }

            try {
                const qr = await fetchQrFromEvolution();
                return NextResponse.json({
                    instance: EVOLUTION_INSTANCE,
                    status: 'waiting_scan',
                    qr
                });
            } catch (e) {
                console.error("[Evolution] QR fetch error:", e.response?.data || e.message);
                return NextResponse.json({
                    instance: EVOLUTION_INSTANCE,
                    status: 'error',
                    qr: null,
                    error: 'No se pudo obtener el QR. Intenta RESET TOTAL.'
                });
            }
        }

        // --- DEFAULT: Only check status (NEVER generates QR) ---
        const { state, exists } = await checkConnectionStatus();

        // Auto-create if missing
        if (!exists) {
            try {
                await createInstance();
                return NextResponse.json({ instance: EVOLUTION_INSTANCE, status: 'created' });
            } catch (e) {
                return NextResponse.json({ instance: EVOLUTION_INSTANCE, status: 'create_failed' });
            }
        }

        return NextResponse.json({ instance: EVOLUTION_INSTANCE, status: state });

    } catch (error) {
        console.error("[Evolution] GET error:", error.message);
        return NextResponse.json({ error: 'Error interno' }, { status: 500 });
    }
}

// ===== POST: Actions (logout, restart, delete, full_reset) =====
export async function POST(request) {
    try {
        const { action } = await request.json();

        if (action === 'logout') {
            try {
                console.log("[Evolution] Logging out instance...");
                await axios.delete(`${EVOLUTION_API_URL}/instance/logout/${EVOLUTION_INSTANCE}`, { 
                    headers,
                    timeout: 5000 // Only wait 5 seconds max
                });
            } catch (e) {
                console.log("[Evolution] Logout response delayed or error (ignoring):", e.message);
                // We ignore the error because Evolution API often disconnects the instance 
                // in the background even if the HTTP request times out.
            }
            return NextResponse.json({ success: true });
        }

        if (action === 'restart') {
            await axios.post(`${EVOLUTION_API_URL}/instance/restart/${EVOLUTION_INSTANCE}`, {}, { headers });
            return NextResponse.json({ success: true });
        }

        if (action === 'delete') {
            await axios.delete(`${EVOLUTION_API_URL}/instance/delete/${EVOLUTION_INSTANCE}`, { headers });
            return NextResponse.json({ success: true });
        }

        // FULL RESET: Delete → Wait → Create → Wait → Get QR → Return with QR
        if (action === 'full_reset') {
            // Step 1: Delete
            try {
                await axios.delete(`${EVOLUTION_API_URL}/instance/delete/${EVOLUTION_INSTANCE}`, { headers });
                console.log("[Evolution] RESET: Deleted instance");
            } catch (e) {
                console.log("[Evolution] RESET: Delete skipped:", e.message);
            }

            await new Promise(r => setTimeout(r, 3000));

            // Step 2: Create
            try {
                await createInstance();
                console.log("[Evolution] RESET: Created instance");
            } catch (e) {
                console.error("[Evolution] RESET: Create failed:", e.message);
                return NextResponse.json({ success: false, error: 'No se pudo crear la instancia' });
            }

            await new Promise(r => setTimeout(r, 3000));

            // Step 3: Get QR immediately and return it
            try {
                const qr = await fetchQrFromEvolution();
                console.log("[Evolution] RESET: Got QR code");
                return NextResponse.json({ success: true, qr });
            } catch (e) {
                console.error("[Evolution] RESET: QR fetch failed:", e.message);
                return NextResponse.json({ success: true, qr: null });
            }
        }

        return NextResponse.json({ error: 'Acción no válida' }, { status: 400 });
    } catch (error) {
        console.error("[Evolution] POST error:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
