import { getDateTruth } from './lib/chatbot/utils/date_helper.js';

const now = new Date('2026-02-12T11:33:00-05:00');
const targetDate = '2026-07-25';

console.log("=== getDateTruth OUTPUT ===\n");
console.log(getDateTruth(targetDate, now));
console.log("\n");
