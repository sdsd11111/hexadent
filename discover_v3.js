
const axios = require('axios');

const API_KEY = '39f0a02b2532c0b197f0fe5a3ec2dc02';
const BASE_URL = 'https://api.ycloud.com/v1';

async function exhaustiveSearch() {
    const tests = [
        { name: 'Me', url: '/me' },
        { name: 'Balance', url: '/balance' },
        { name: 'Channels', url: '/channels' },
        { name: 'WA Phone Numbers', url: '/whatsapp/phoneNumbers' },
        { name: 'WA WABAs', url: '/whatsapp/businessAccounts' },
        { name: 'WA Templates', url: '/whatsapp/templates' },
        { name: 'Webhook Endpoints', url: '/webhookEndpoints' }
    ];

    console.log("--- Starting Exhaustive Search ---");
    for (const t of tests) {
        try {
            const res = await axios.get(BASE_URL + t.url, {
                headers: { 'X-API-Key': API_KEY }
            });
            console.log(`[OK] ${t.name}:`, JSON.stringify(res.data, null, 2).substring(0, 300));
        } catch (err) {
            console.log(`[FAIL] ${t.name}: ${err.response?.status} - ${err.response?.data?.error?.message || err.message}`);
        }
    }

    // Try to send a message with the WABA ID as 'from' just as a hail mary
    try {
        console.log("--- Hail Mary: Sending with WABA ID 1506150767138785 ---");
        const res = await axios.post(BASE_URL + '/whatsapp/messages', {
            from: '1506150767138785',
            to: '+593967491847',
            type: 'text',
            text: { body: 'Ping from script' }
        }, {
            headers: { 'X-API-Key': API_KEY }
        });
        console.log("[HAIL MARY SUCCESS]:", res.data.id);
    } catch (err) {
        console.log(`[HAIL MARY FAIL]: ${err.response?.status} - ${err.response?.data?.error?.message}`);
    }
}

exhaustiveSearch();
