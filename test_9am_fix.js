import { resolveDate } from './lib/chatbot/utils/date_helper.js';

const now = new Date('2026-02-12T18:00:00-05:00');
console.log('--- TEST: resolveDate for 9 am ---');
const res = resolveDate('a las 9 am', now);
console.log('Result:', res);

if (res === null) {
    console.log('✅ SUCCESS: "9 am" ignored as a date.');
} else {
    console.log('❌ FAILURE: "9 am" mistakenly resolved to:', res);
}

console.log('\n--- TEST: resolveDate for mañana ---');
const res2 = resolveDate('mañana', now);
console.log('Result:', res2);
if (res2 === '2026-02-13') {
    console.log('✅ SUCCESS: "mañana" resolved correctly.');
} else {
    console.log('❌ FAILURE: "mañana" resolved to:', res2);
}
