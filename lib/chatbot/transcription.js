import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';
import { v4 as uuidv4 } from 'uuid';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Transcribes a base64 audio string using OpenAI Whisper.
 * @param {string} base64Audio - The base64 encoded audio data.
 * @returns {Promise<string>} - The transcribed text.
 */
export async function transcribeAudio(base64Audio) {
    if (!base64Audio) {
        throw new Error("No audio data provided.");
    }

    // Identify temp directory
    const tempDir = path.join(process.cwd(), 'tmp');
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
    }

    // Create a temporary file path
    // WhatsApp voice notes are usually OGG/Opus. Whisper supports OGG.
    const tempFilePath = path.join(tempDir, `${uuidv4()}.ogg`);

    try {
        // Convert to buffer if it's a string (base64)
        const buffer = Buffer.isBuffer(base64Audio)
            ? base64Audio
            : Buffer.from(base64Audio, 'base64');

        fs.writeFileSync(tempFilePath, buffer);

        // Send to OpenAI Whisper
        const transcription = await openai.audio.transcriptions.create({
            file: fs.createReadStream(tempFilePath),
            model: "whisper-1",
            language: "es", // Hint to prioritize Spanish
        });

        // Cleanup temp file
        try { fs.unlinkSync(tempFilePath); } catch (e) { console.error("Error deleting temp audio:", e); }

        return transcription.text;

    } catch (error) {
        // Ensure cleanup on error
        if (fs.existsSync(tempFilePath)) {
            try { fs.unlinkSync(tempFilePath); } catch (e) { }
        }
        console.error("[Transcription] Error:", error.message);
        throw new Error("No pude escuchar el audio. Por favor escríbeme.");
    }
}
