import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import os from 'os';
import FormData from 'form-data';
import axios from 'axios';

/**
 * Transcribes audio using Groq Whisper API (Fast & Reliable).
 * @param {string} base64Audio - The base64 encoded audio data.
 * @returns {Promise<string>} - The transcribed text.
 */
export async function transcribeAudio(base64Audio) {
    if (!base64Audio) {
        throw new Error("No audio data provided.");
    }

    if (!process.env.GROQ_API_KEY) {
        throw new Error("GROQ_API_KEY not configured for transcription.");
    }

    const tempDir = os.tmpdir();
    const tempFilePath = path.join(tempDir, `audio_${uuidv4()}.ogg`);

    try {
        // Convert base64 to buffer and save to temp file
        const buffer = Buffer.isBuffer(base64Audio)
            ? base64Audio
            : Buffer.from(base64Audio, 'base64');
        
        fs.writeFileSync(tempFilePath, buffer);
        console.log("[Transcription] Saved audio to:", tempFilePath, "Size:", buffer.length);

        // Call Groq Whisper API using axios
        const formData = new FormData();
        formData.append('file', fs.createReadStream(tempFilePath), {
            filename: 'audio.ogg',
            contentType: 'audio/ogg'
        });
        formData.append('model', 'whisper-large-v3');
        formData.append('language', 'es');
        formData.append('response_format', 'json');

        const response = await axios.post(
            'https://api.groq.com/openai/v1/audio/transcriptions',
            formData,
            {
                headers: {
                    'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                    ...formData.getHeaders()
                },
                timeout: 30000 // 30 second timeout
            }
        );

        console.log("[Transcription] Groq Whisper Result:", response.data.text);

        // Cleanup temp file
        try {
            fs.unlinkSync(tempFilePath);
        } catch (e) {
            // Ignore cleanup errors
        }

        return response.data.text?.trim() || "No pude entender el audio.";

    } catch (error) {
        console.error("[Transcription] Groq Whisper Error:", error.message);
        if (error.response) {
            console.error("[Transcription] Groq API Response:", error.response.status, error.response.data);
        }
        
        // Cleanup temp file on error
        try {
            if (fs.existsSync(tempFilePath)) {
                fs.unlinkSync(tempFilePath);
            }
        } catch (e) {
            // Ignore cleanup errors
        }
        
        throw new Error("No pude escuchar el audio. Por favor escríbeme.");
    }
}
