const axios = require('axios');

const EVOLUTION_API_URL = "http://178.238.238.158:8080";
const EVOLUTION_API_KEY = "42a447c1-3d74-4b52-9571-042c174f7621";
const EVOLUTION_INSTANCE = "Odontologa";
const headers = { 'apikey': EVOLUTION_API_KEY };

async function main() {
    console.log("Checking connection state...");
    try {
        const statusUrl = `${EVOLUTION_API_URL}/instance/connectionState/${EVOLUTION_INSTANCE}`;
        const res = await axios.get(statusUrl, { headers });
        console.log("Status response status:", res.status);
        console.log("Status response data:", JSON.stringify(res.data, null, 2));
    } catch (e) {
        console.error("Status check failed:", e.response ? { status: e.response.status, data: e.response.data } : e.message);
    }

    console.log("\nAttempting to connect/get QR...");
    try {
        const qrUrl = `${EVOLUTION_API_URL}/instance/connect/${EVOLUTION_INSTANCE}`;
        const res = await axios.get(qrUrl, { headers });
        console.log("Connect/QR response status:", res.status);
        console.log("Connect/QR response keys:", Object.keys(res.data));
        console.log("Connect/QR full response data:", JSON.stringify(res.data, null, 2));
    } catch (e) {
        console.error("Connect/QR failed:", e.response ? { status: e.response.status, data: e.response.data } : e.message);
    }
}

main();
