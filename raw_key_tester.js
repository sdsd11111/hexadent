const fs = require('fs');
require('dotenv').config();

console.log(">>> [STRICT DEBUG] Verifying API Keys presence");
const keys = ['GROQ_API_KEY', 'GEMINI_API_KEY', 'OPENROUTER_API_KEY'];
keys.forEach(k => {
    const v = process.env[k];
    console.log(`${k}: ${v ? 'FOUND (' + v.substring(0, 5) + '...)' : 'MISSING'}`);
});

async function rawTestGemini() {
    console.log(">>> [RAW] Testing Gemini via fetch...");
    const key = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;
    const body = {
        contents: [{ parts: [{ text: "Hola" }] }]
    };

    try {
        const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
        const response = await fetch(url, {
            method: 'POST',
            body: JSON.stringify(body),
            headers: { 'Content-Type': 'application/json' }
        });
        const data = await response.json();
        console.log(">>> [RAW RESPONSE]");
        console.log(JSON.stringify(data, null, 2));
    } catch (err) {
        console.error(">>> [RAW ERROR]", err.message);
    }
}

rawTestGemini();
