import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

const testMessages = [
  { role: "system", content: "Eres un asistente dental. Responde en máximo 1 oración." },
  { role: "user", content: "Hola, ¿cuánto cuesta una limpieza dental?" }
];

async function testGroq() {
  console.log("\n═══ TEST 1: GROQ ═══");
  try {
    const groq = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: "https://api.groq.com/openai/v1"
    });
    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: testMessages,
      temperature: 0.3,
      max_tokens: 100,
    });
    console.log("✅ GROQ OK:", response.choices[0].message.content.substring(0, 50));
    return true;
  } catch (err) {
    console.log("❌ GROQ FALLÓ:", err.message);
    return false;
  }
}

async function testGemini() {
  console.log("\n═══ TEST 2: GEMINI ═══");
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("Hola");
    console.log("✅ GEMINI OK:", result.response.text().substring(0, 50));
    return true;
  } catch (err) {
    console.log("❌ GEMINI FALLÓ:", err.message);
    return false;
  }
}

async function testOpenRouter() {
  console.log("\n═══ TEST 3: OPENROUTER ═══");
  try {
    const openRouter = new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: "https://openrouter.ai/api/v1",
    });
    const response = await openRouter.chat.completions.create({
      model: "openrouter/auto",
      messages: testMessages,
      temperature: 0.3,
      max_tokens: 100,
    });
    const content = response.choices[0]?.message?.content;
    console.log("✅ OPENROUTER OK:", content?.substring(0, 50));
    return !!content;
  } catch (err) {
    console.log("❌ OPENROUTER FALLÓ:", err.message);
    return false;
  }
}

console.log("🔍 Verificando Cascada Final...\n");
await testGroq();
await testGemini();
await testOpenRouter();
