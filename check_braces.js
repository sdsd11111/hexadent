const fs = require('fs');

const path = 'd:\\Abel paginas\\Hexadent\\2do intento\\hexadent-main\\lib\\chatbot\\logic.js';
const code = fs.readFileSync(path, 'utf8');

let stack = [];
let invalid = null;

for (let i = 0; i < code.length; i++) {
    const char = code[i];
    if (char === '{') {
        stack.push(i);
    } else if (char === '}') {
        if (stack.length === 0) {
            invalid = i;
            break;
        }
        stack.pop();
    }
}

if (invalid !== null) {
    const lines = code.substring(0, invalid).split('\n');
    console.log(`❌ Extra closing brace '}' at line ${lines.length}.`);
} else if (stack.length > 0) {
    const lines = code.substring(0, stack[stack.length - 1]).split('\n');
    console.log(`❌ Unclosed opening brace '{' at line ${lines.length}.`);
} else {
    console.log(`✅ Braces are balanced.`);
}
