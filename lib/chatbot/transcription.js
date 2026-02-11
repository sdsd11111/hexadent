import OpenAI from "openai";
import fs from 'fs';
import path from 'path';
import os from 'os';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Transcribes an audio buffer using OpenAI Whisper.
 * @param {Buffer} audioBuffer - The raw audio data.
 * @returns {Promise<string>} - The transcribed text.
 */
export async function transcribeAudio(audioBuffer) {
    const tempFilePath = path.join(os.tmpdir(), `audio-${Date.now()}.ogg`);

    try {
        // Whisper API requires a file with accurate extension
        fs.writeFileSync(tempFilePath, audioBuffer);

        const response = await openai.audio.transcriptions.create({
            file: fs.createReadStream(tempFilePath),
            model: "whisper-1",
            language: "es", // Optimization for Spanish
        });

        return response.text;
    } catch (error) {
        console.error("[Transcription Error]:", error.message);
        throw error;
    } finally {
        // Clean up temp file
        if (fs.existsSync(tempFilePath)) {
            try {
                fs.unlinkSync(tempFilePath);
            } catch (e) {
                console.warn("[Transcription] Could not delete temp file:", e.message);
            }
        }
    }
}
