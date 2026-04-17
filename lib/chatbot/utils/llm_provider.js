import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Multi-provider LLM Client (Cascade: Groq -> Gemini -> OpenRouter)
 * Focuses on FREE models.
 */
export async function getChatCompletion(messages, options = {}) {
    const systemPrompt = messages.find(m => m.role === 'system')?.content || "";
    const userMessages = messages.filter(m => m.role !== 'system');

    // 1. Try GROQ (Llama 3.3 70B)
    if (process.env.GROQ_API_KEY) {
        try {
            console.log("[LLM Provider] Attempting GROQ...");
            const groq = new OpenAI({
                apiKey: process.env.GROQ_API_KEY,
                baseURL: "https://api.groq.com/openai/v1"
            });
            const response = await groq.chat.completions.create({
                model: "llama-3.1-8b-instant",  // Modelo más pequeño y rápido, menos limitado
                messages: messages,
                temperature: options.temperature || 0.3,
                max_tokens: 1024,  // Limitar tokens para no agotar cuota
            });
            console.log("[LLM Provider] GROQ Success.");
            return response.choices[0].message.content;
        } catch (err) {
            console.warn("[LLM Provider] GROQ Failed:", err.response?.data || err.message);
        }
    }

    // 2. Try GEMINI (Gemini 1.5 Flash)
    if (process.env.GEMINI_API_KEY) {
        try {
            console.log("[LLM Provider] Attempting GEMINI...");
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-8b" });  // Modelo actualizado y estable

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

    // 3. Try OPENROUTER (Gemma 2 9B Free or similar)
    if (process.env.OPENROUTER_API_KEY) {
        try {
            console.log("[LLM Provider] Attempting OPENROUTER...");
            const openRouter = new OpenAI({
                apiKey: process.env.OPENROUTER_API_KEY,
                baseURL: "https://openrouter.ai/api/v1",
                defaultHeaders: {
                    "HTTP-Referer": "https://hexadent.com", // Optional for OpenRouter
                    "X-Title": "Hexadent Chatbot",
                }
            });
            const response = await openRouter.chat.completions.create({
                model: "meta-llama/llama-3.1-8b-instruct:free",  // Modelo gratuito alternativo que funciona
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

    // Fallback if all fail
    throw new Error("All LLM providers failed or no API keys configured.");
}
