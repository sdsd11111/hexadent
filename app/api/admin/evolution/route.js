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
        let instanceExists = true;

        try {
            const statusRes = await axios.get(statusUrl, {
                headers: { 'apikey': EVOLUTION_API_KEY }
            });
            // Support both v1 and v2 structures
            connectionStatus = statusRes.data?.instance?.state || statusRes.data?.status || 'unknown';
        } catch (e) {
            console.error("[Evolution Proxy] Error checking connection state:", e.message);
            if (e.response?.status === 404) {
                instanceExists = false;
                connectionStatus = 'disconnected';
            }
        }

        // 2. If instance doesn't exist, try to create it
        if (!instanceExists) {
            try {
                console.log("[Evolution Proxy] Instance not found, attempting to create:", EVOLUTION_INSTANCE);
                await axios.post(`${EVOLUTION_API_URL}/instance/create`, {
                    instanceName: EVOLUTION_INSTANCE,
                    token: EVOLUTION_API_KEY,
                    number: "",
                    qrcode: true
                }, {
                    headers: { 'apikey': EVOLUTION_API_KEY }
                });
                // After creating, we wait a bit and mark as disconnected to trigger QR fetch
                connectionStatus = 'disconnected';
            } catch (createErr) {
                console.error("[Evolution Proxy] Error creating instance:", createErr.message);
            }
        }

        // 3. If not connected, try to get QR
        let qrData = null;
        const isConnected = ['open', 'CONNECTED', 'connected'].includes(connectionStatus);

        if (!isConnected) {
            const qrUrl = `${EVOLUTION_API_URL}/instance/connect/${EVOLUTION_INSTANCE}`;
            try {
                const qrRes = await axios.get(qrUrl, {
                    headers: { 'apikey': EVOLUTION_API_KEY }
                });

                // Evolution API returns base64 or code depending on config
                // Check multiple possible paths for QR data
                const resData = qrRes.data;
                let rawQr = resData.base64 || 
                            resData.code || 
                            resData.qrcode?.base64 || 
                            resData.qrcode?.code ||
                            resData.data?.qrcode ||
                            resData.data?.base64;

                if (rawQr) {
                    // Clean base64 if it has the prefix already, to avoid double prefixing in frontend
                    if (typeof rawQr === 'string' && rawQr.includes('base64,')) {
                        qrData = rawQr.split('base64,')[1];
                    } else {
                        qrData = rawQr;
                    }
                }

                console.log("[Evolution Proxy] QR Data retrieved, length:", qrData?.length);
            } catch (e) {
                console.error("[Evolution Proxy] Error fetching QR code:", e.message);
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
