
const targetDate = '2026-07-25';
const dayOfWeek = new Date(`${targetDate}T12:00:00-05:00`).getDay();
const isSaturday = dayOfWeek === 6;

console.log(`Target Date: ${targetDate}`);
console.log(`Day of week: ${dayOfWeek} (0=Sun, 6=Sat)`);
console.log(`Is Saturday: ${isSaturday}`);

const afternoonStart = isSaturday ? 13 : 15;
console.log(`Afternoon Start: ${afternoonStart}`);

// Mock slots from test_july_slots.js
const slots = ["08:30", "09:00", "13:00", "14:45"];
const morningSlots = slots.filter(s => parseInt(s.split(':')[0]) < 13);
const afternoonSlots = slots.filter(s => parseInt(s.split(':')[0]) >= afternoonStart);

console.log(`Morning Slots: ${morningSlots.join(', ')}`);
console.log(`Afternoon Slots: ${afternoonSlots.join(', ')}`);
