
const axios = require('axios');

const API_KEY = '39f0a02b2532c0b197f0fe5a3ec2dc02';
const BASE_URL = 'https://api.ycloud.com/v1';

const endpoints = [
    { method: 'GET', url: '/me' },
    { method: 'GET', url: '/balance' },
    { method: 'GET', url: '/whatsapp/phoneNumbers' },
    { method: 'GET', url: '/whatsapp/businessAccounts' },
    { method: 'POST', url: '/whatsapp/messages', data: { from: '697cbe6208467e16252dda28', to: '+593967491847', type: 'text', text: { body: 'test' } } }
];

const bases = ['https://api.ycloud.com/v1', 'https://api.ycloud.com/v2'];

async function discover() {
    for (const base of bases) {
        console.log(`--- Testing Base: ${base} ---`);
        for (const ep of endpoints) {
            try {
                const fullUrl = `${base}${ep.url}`;
                console.log(`Checking ${ep.method} ${fullUrl}...`);
                let res;
                if (ep.method === 'GET') {
                    res = await axios.get(fullUrl, { headers: { 'X-API-Key': API_KEY } });
                } else {
                    res = await axios.post(fullUrl, ep.data, { headers: { 'X-API-Key': API_KEY } });
                }
                console.log(`[SUCCESS] ${ep.url}: status ${res.status}`);
            } catch (err) {
                console.log(`[FAILED ] ${ep.url}: status ${err.response?.status || 'ERROR'} - ${err.response?.data?.error?.message || err.message}`);
                if (err.response?.data) console.log('Body:', JSON.stringify(err.response.data).substring(0, 100));
            }
        }
    }
}

discover();
