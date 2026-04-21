import { NextResponse } from 'next/server';
import axios from 'axios';

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL;
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY;
const EVOLUTION_INSTANCE = process.env.EVOLUTION_INSTANCE;

// Simple server-side cache to keep the QR stable for 40 seconds
let cachedQr = {
    data: null,
    timestamp: 0,
    instance: null
};

export async function GET() {
    try {
        if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY || !EVOLUTION_INSTANCE) {
            return NextResponse.json({ error: 'Configuración de Evolution API incompleta' }, { status: 500 });
        }

        // 1. Check connection status
        const statusUrl = `${EVOLUTION_API_URL}/instance/connectionState/${EVOLUTION_INSTANCE}`;
        let connectionStatus = 'unknown';
        let instanceExists = true;

        try {
            const statusRes = await axios.get(statusUrl, {
                headers: { 'apikey': EVOLUTION_API_KEY }
            });
            connectionStatus = statusRes.data?.instance?.state || statusRes.data?.status || 'unknown';
        } catch (e) {
            if (e.response?.status === 404) {
                instanceExists = false;
                connectionStatus = 'disconnected';
            }
        }

        // 2. If instance doesn't exist, try to create it
        if (!instanceExists) {
            try {
                await axios.post(`${EVOLUTION_API_URL}/instance/create`, {
                    instanceName: EVOLUTION_INSTANCE,
                    token: EVOLUTION_API_KEY,
                    qrcode: true,
                    number: ""
                }, { headers: { 'apikey': EVOLUTION_API_KEY } });
                await new Promise(r => setTimeout(r, 2000));
                connectionStatus = 'disconnected';
            } catch (createErr) {
                console.error("[Evolution Proxy] Create Error:", createErr.response?.data || createErr.message);
            }
        }

        // 3. QR Stability Logic: Only fetch a new QR if the old one is > 40s old
        const now = Date.now();
        const isConnected = ['open', 'CONNECTED', 'connected'].includes(connectionStatus);
        
        let qrData = null;
        if (!isConnected) {
            // Use cache if it's fresh and for the same instance
            if (cachedQr.data && (now - cachedQr.timestamp < 40000) && cachedQr.instance === EVOLUTION_INSTANCE) {
                qrData = cachedQr.data;
            } else {
                const qrUrl = `${EVOLUTION_API_URL}/instance/connect/${EVOLUTION_INSTANCE}`;
                try {
                    const qrRes = await axios.get(qrUrl, { headers: { 'apikey': EVOLUTION_API_KEY } });
                    const resData = qrRes.data;
                    qrData = resData.qrcode || resData.base64 || (resData.data && (resData.data.qrcode || resData.data.base64));
                    
                    // Update cache
                    if (qrData) {
                        cachedQr = { data: qrData, timestamp: now, instance: EVOLUTION_INSTANCE };
                    }
                } catch (e) {
                    console.error("[Evolution Proxy] QR Fetch Error:", e.message);
                }
            }
        } else {
            // Clear cache if connected
            cachedQr = { data: null, timestamp: 0, instance: null };
        }

        return NextResponse.json({
            instance: EVOLUTION_INSTANCE,
            status: connectionStatus,
            qr: qrData
        });

    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

/**
 * Handle instance actions (logout, restart)
 */
export async function POST(request) {
    try {
        const { action } = await request.json();

        if (action === 'logout') {
            const logoutUrl = `${EVOLUTION_API_URL}/instance/logout/${EVOLUTION_INSTANCE}`;
            await axios.delete(logoutUrl, { headers: { 'apikey': EVOLUTION_API_KEY } });
            return NextResponse.json({ success: true });
        }

        if (action === 'delete') {
            const deleteUrl = `${EVOLUTION_API_URL}/instance/delete/${EVOLUTION_INSTANCE}`;
            await axios.delete(deleteUrl, { headers: { 'apikey': EVOLUTION_API_KEY } });
            return NextResponse.json({ success: true });
        }

        if (action === 'restart') {
            const restartUrl = `${EVOLUTION_API_URL}/instance/restart/${EVOLUTION_INSTANCE}`;
            await axios.post(restartUrl, {}, { headers: { 'apikey': EVOLUTION_API_KEY } });
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Acción no válida' }, { status: 400 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
