import db from './lib/db.js';

async function debugTime() {
    const dateStr = '2026-02-14';
    const startH = 8, startM = 30;
    const durationMin = 20;

    // Simulate makeEcuTs
    const makeEcuTs = (h, m) => {
        const d = new Date(`${dateStr}T${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:00Z`);
        return d.getTime() + (5 * 60 * 60 * 1000);
    };

    const startTs = makeEcuTs(startH, startM);
    const nowTs = Date.now();
    const leadLimitTs = nowTs + (24 * 60 * 60 * 1000);
    const durationMs = durationMin * 60 * 1000;

    console.log('=== DEBUG 8:30 AM Saturday ===');
    console.log('Current Time (Now):', new Date(nowTs).toISOString());
    console.log('24h Limit (leadLimitTs):', new Date(leadLimitTs).toISOString());
    console.log('8:30 AM Slot Start (startTs):', new Date(startTs).toISOString());
    console.log('8:30 AM Slot End:', new Date(startTs + durationMs).toISOString());
    console.log('');
    console.log('Is 8:30 blocked by 24h rule?', startTs < leadLimitTs ? 'YES ❌' : 'NO ✅');
    console.log('');
    console.log('Ecuador Now (approx):', new Date(nowTs - 5 * 60 * 60 * 1000).toISOString());

    process.exit(0);
}

debugTime();
