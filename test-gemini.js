import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

const testMessages = [
  { role: "system", content: "Eres un asistente dental. Responde en máximo 1 oración." },
  { role: "user", content: "Hola, ¿cuánto cuesta una limpieza dental?" }
];

async function testGemini() {
  console.log("\n═══ TEST: GEMINI (Probando models/gemini-1.5-flash) ═══");
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-flash" });
    const result = await model.generateContent("Hola");
    console.log(`✅ GEMINI OK:`, result.response.text());
    return true;
  } catch (err) {
    console.log(`❌ GEMINI FALLÓ:`, err.message);
    return false;
  }
}

await testGemini();
