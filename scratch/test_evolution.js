const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Manually read .env
const envPath = path.join(__dirname, '../.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) env[key.trim()] = value.trim();
});

const EVOLUTION_API_URL = env.EVOLUTION_API_URL;
const EVOLUTION_API_KEY = env.EVOLUTION_API_KEY;
const EVOLUTION_INSTANCE = env.EVOLUTION_INSTANCE;

async function testEvolution() {
    console.log("Testing Evolution API...");
    console.log("URL:", EVOLUTION_API_URL);
    console.log("Instance:", EVOLUTION_INSTANCE);

    try {
        const statusUrl = `${EVOLUTION_API_URL}/instance/connectionState/${EVOLUTION_INSTANCE}`;
        console.log("Checking status:", statusUrl);
        const statusRes = await axios.get(statusUrl, {
            headers: { 'apikey': EVOLUTION_API_KEY }
        });
        console.log("Status Response:", JSON.stringify(statusRes.data, null, 2));

        if (statusRes.data.instance.state !== 'open') {
            const qrUrl = `${EVOLUTION_API_URL}/instance/connect/${EVOLUTION_INSTANCE}`;
            console.log("Fetching QR:", qrUrl);
            const qrRes = await axios.get(qrUrl, {
                headers: { 'apikey': EVOLUTION_API_KEY }
            });
            console.log("QR Response keys:", Object.keys(qrRes.data));
            if (qrRes.data.qrcode) {
                console.log("QR Code found in 'qrcode' property");
            }
            console.log("QR Response Sample:", JSON.stringify(qrRes.data).substring(0, 500));
        } else {
            console.log("Instance is already OPEN");
        }
    } catch (e) {
        console.error("Error:", e.message);
        if (e.response) {
            console.error("Response data:", e.response.data);
        }
    }
}

testEvolution();
