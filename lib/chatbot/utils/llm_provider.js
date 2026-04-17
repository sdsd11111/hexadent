import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Multi-provider LLM Client (Cascade: DeepSeek -> Groq -> Gemini -> OpenRouter)
 * Focuses on FREE or CHEAP models.
 */
export async function getChatCompletion(messages, options = {}) {
    const systemPrompt = messages.find(m => m.role === 'system')?.content || "";
    const userMessages = messages.filter(m => m.role !== 'system');

    // 1. Try DEEPSEEK (DeepSeek Chat V3 - muy bueno y barato)
    if (process.env.DEEPSEEK_API_KEY) {
        try {
            console.log("[LLM Provider] Attempting DEEPSEEK...");
            const deepseek = new OpenAI({
                apiKey: process.env.DEEPSEEK_API_KEY,
                baseURL: "https://api.deepseek.com/v1"
            });
            const response = await deepseek.chat.completions.create({
                model: "deepseek-chat",  // DeepSeek V3
                messages: messages,
                temperature: options.temperature || 0.3,
                max_tokens: 1024,
            });
            console.log("[LLM Provider] DEEPSEEK Success.");
            return response.choices[0].message.content;
        } catch (err) {
            console.warn("[LLM Provider] DEEPSEEK Failed:", err.response?.data || err.message);
        }
    }

    // 2. Try GROQ (Llama 3.1 8B - modelo pequeño, rápido)
    if (process.env.GROQ_API_KEY) {
        try {
            console.log("[LLM Provider] Attempting GROQ...");
            const groq = new OpenAI({
                apiKey: process.env.GROQ_API_KEY,
                baseURL: "https://api.groq.com/openai/v1"
            });
            const response = await groq.chat.completions.create({
                model: "llama-3.1-8b-instant",
                messages: messages,
                temperature: options.temperature || 0.3,
                max_tokens: 1024,
            });
            console.log("[LLM Provider] GROQ Success.");
            return response.choices[0].message.content;
        } catch (err) {
            console.warn("[LLM Provider] GROQ Failed:", err.response?.data || err.message);
        }
    }

    // 3. Try GEMINI (Gemini 1.5 Flash 8B)
    if (process.env.GEMINI_API_KEY) {
        try {
            console.log("[LLM Provider] Attempting GEMINI...");
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-8b" });

            // Convert OpenAI format to Gemini format
            const contents = userMessages.map(m => ({
                role: m.role === 'user' ? 'user' : 'model',
                parts: [{ text: m.content }]
            }));

            const result = await model.generateContent({
                systemInstruction: systemPrompt,
                contents: contents,
                generationConfig: {
                    temperature: options.temperature || 0.3,
                }
            });

            console.log("[LLM Provider] GEMINI Success.");
            return result.response.text();
        } catch (err) {
            console.warn("[LLM Provider] GEMINI Failed:", err.message);
            if (err.stack) console.debug(err.stack);
        }
    }

    // 4. Try OPENROUTER (Llama 3.1 8B Free)
    if (process.env.OPENROUTER_API_KEY) {
        try {
            console.log("[LLM Provider] Attempting OPENROUTER...");
            const openRouter = new OpenAI({
                apiKey: process.env.OPENROUTER_API_KEY,
                baseURL: "https://openrouter.ai/api/v1",
                defaultHeaders: {
                    "HTTP-Referer": "https://hexadent.com",
                    "X-Title": "Hexadent Chatbot",
                }
            });
            const response = await openRouter.chat.completions.create({
                model: "meta-llama/llama-3.1-8b-instruct:free",
                messages: messages,
                temperature: options.temperature || 0.3,
                max_tokens: 1024,
            });
            console.log("[LLM Provider] OPENROUTER Success.");
            return response.choices[0].message.content;
        } catch (err) {
            console.warn("[LLM Provider] OPENROUTER Failed:", err.response?.data || err.message);
        }
    }

    // Fallback if all fail - return a safe message instead of crashing
    console.error("[LLM Provider] ALL PROVIDERS FAILED. Returning fallback message.");
    return "Disculpe, estoy experimentando dificultades técnicas momentáneas. Por favor, intente nuevamente en unos minutos o contacte directamente a Hexadent al 096 341 0409. Estamos a sus órdenes. 😊";
}
