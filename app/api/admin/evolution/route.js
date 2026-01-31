import { NextResponse } from 'next/server';
import axios from 'axios';

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL;
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY;
const EVOLUTION_INSTANCE = process.env.EVOLUTION_INSTANCE;

export async function GET() {
    try {
        if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY || !EVOLUTION_INSTANCE) {
            return NextResponse.json({ error: 'Configuración de Evolution API incompleta' }, { status: 500 });
        }

        // 1. Check connection status
        const statusUrl = `${EVOLUTION_API_URL}/instance/connectionState/${EVOLUTION_INSTANCE}`;
        let connectionStatus = 'unknown';

        try {
            const statusRes = await axios.get(statusUrl, {
                headers: { 'apikey': EVOLUTION_API_KEY }
            });
            connectionStatus = statusRes.data.instance.state;
        } catch (e) {
            console.error("Error checking connection state:", e.message);
        }

        // 2. If not connected, try to get QR
        let qrData = null;
        if (connectionStatus !== 'open') {
            const qrUrl = `${EVOLUTION_API_URL}/instance/connect/${EVOLUTION_INSTANCE}`;
            try {
                const qrRes = await axios.get(qrUrl, {
                    headers: { 'apikey': EVOLUTION_API_KEY }
                });

                // Evolution API returns base64 or code depending on config
                let rawQr = qrRes.data.base64 || qrRes.data.code;

                // Clean base64 if it has the prefix already, to avoid double prefixing in frontend
                if (rawQr && rawQr.includes('base64,')) {
                    qrData = rawQr.split('base64,')[1];
                } else {
                    qrData = rawQr;
                }

                console.log("[Evolution Proxy] QR Data length:", qrData?.length);
            } catch (e) {
                console.error("Error fetching QR code:", e.message);
            }
        }

        return NextResponse.json({
            instance: EVOLUTION_INSTANCE,
            status: connectionStatus,
            qr: qrData
        });

    } catch (error) {
        console.error("Evolution Admin API Error:", error);
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

        return NextResponse.json({ error: 'Acción no válida' }, { status: 400 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
