import fs from 'fs';
import path from 'path';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { v4 as uuidv4 } from 'uuid';

/**
 * Transcribes audio using Gemini 1.5 Flash (Free Tier).
 * @param {string} base64Audio - The base64 encoded audio data.
 * @returns {Promise<string>} - The transcribed text.
 */
export async function transcribeAudio(base64Audio) {
    if (!base64Audio) {
        throw new Error("No audio data provided.");
    }

    if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY not configured for transcription.");
    }

    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });  // Modelo estable sin sufijo

        const buffer = Buffer.isBuffer(base64Audio)
            ? base64Audio
            : Buffer.from(base64Audio, 'base64');

        const result = await model.generateContent([
            {
                inlineData: {
                    mimeType: "audio/ogg", // WhatsApp audio is typically ogg
                    data: buffer.toString('base64')
                }
            },
            { text: "Por favor transcribe este audio de WhatsApp de manera literal. Si no hay voz o es ininteligible, responde con '[ININTELIGIBLE]'." }
        ]);

        const transcription = result.response.text();
        console.log("[Transcription] Gemini Result:", transcription);

        return transcription.replace(/\[ININTELIGIBLE\]/g, '').trim() || "No pude entender el audio.";

    } catch (error) {
        console.error("[Transcription] Gemini Error:", error.message);
        throw new Error("No pude escuchar el audio. Por favor escríbeme.");
    }
}
