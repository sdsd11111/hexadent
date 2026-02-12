
// Standalone Slot Logic Re-implementation for Debugging
const dateStr = '2026-07-20';
const durationMin = 20;

let startH = 9, startM = 0;
let endH = 18, endM = 0;
let lunchHStart = 13, lunchHEnd = 15;

const makeEcuTs = (h, m) => {
    const d = new Date(`${dateStr}T${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:00Z`);
    return d.getTime() + (5 * 60 * 60 * 1000);
};

const startTs = makeEcuTs(startH, startM);
const limitTs = makeEcuTs(endH, endM);
const durationMs = durationMin * 60 * 1000;
const stepMs = 15 * 60 * 1000;

console.log(`START: ${new Date(startTs).toISOString()}`);
console.log(`LIMIT: ${new Date(limitTs).toISOString()}`);

const available = [];
let currentTs = startTs;

while (currentTs + durationMs <= limitTs) {
    const nextTs = currentTs + durationMs;
    const ecuDate = new Date(currentTs - (5 * 60 * 60 * 1000));
    const h = ecuDate.getUTCHours();
    const m = ecuDate.getUTCMinutes();
    const timeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;

    let isBlocked = false;

    // Lunch break check: 
    if (lunchHStart !== null && h >= lunchHStart && h < lunchHEnd) {
        isBlocked = true;
    }
    if (lunchHStart !== null) {
        const lunchStartTs = makeEcuTs(lunchHStart, 0);
        if (currentTs < lunchStartTs && nextTs > lunchStartTs) {
            console.log(`BLOCK_LUNCH: ${timeStr} (Starts ${h}:${m}, Ends ${new Date(nextTs - 5 * 3600 * 1000).toISOString()} overlaps lunch ${lunchHStart}:00)`);
            isBlocked = true;
        }
    }

    if (!isBlocked) {
        available.push(timeStr);
    }
    currentTs += stepMs;
}

console.log("\nSlots generated:", available.filter(s => s >= '12:00' && s <= '13:00').join(', '));
