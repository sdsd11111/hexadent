
const axios = require('axios');

const API_KEY = '39f0a02b2532c0b197f0fe5a3ec2dc02';
const BASES = [
    'https://api.ycloud.com/v1',
    'https://api.ycloud.com/v2',
    'https://api.ycloud.com'
];

async function probeBases() {
    console.log("--- Probing YCloud Base URLs ---");
    for (const base of BASES) {
        try {
            console.log(`Testing ${base}/me ...`);
            const res = await axios.get(`${base}/me`, {
                headers: { 'X-API-Key': API_KEY }
            });
            console.log(`[FOUND!] ${base}: status ${res.status}`);
            console.log(JSON.stringify(res.data, null, 2));
        } catch (err) {
            console.log(`[404/ERR] ${base}: ${err.response?.status || 'ERROR'} - ${err.response?.data?.error?.message || err.message}`);
        }
    }
}

probeBases();
