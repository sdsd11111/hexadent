import axios from 'axios';

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL;
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY;
const EVOLUTION_INSTANCE = process.env.EVOLUTION_INSTANCE;

/**
 * Sends a WhatsApp message via Evolution API.
 * @param {string} phoneNumber - Recipient number (e.g., 593...)
 * @param {string} text - The message text.
 */
export async function sendWhatsAppMessage(phoneNumber, text) {
    if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY || !EVOLUTION_INSTANCE) {
        console.error("[Evolution API] Missing configuration in .env");
        throw new Error("Evolution API configuration missing.");
    }

    // Clean number: remove +, spaces, etc.
    let cleanNumber = phoneNumber.replace(/\D/g, '');

    // Normalize Ecuador numbers
    if (cleanNumber.length === 10 && cleanNumber.startsWith('0')) {
        // Case: 0983237491 -> 593983237491
        cleanNumber = '593' + cleanNumber.substring(1);
    } else if (cleanNumber.length === 9 && cleanNumber.startsWith('9')) {
        // Case: 983237491 -> 593983237491
        cleanNumber = '593' + cleanNumber;
    }

    const url = `${EVOLUTION_API_URL}/message/sendText/${EVOLUTION_INSTANCE}`;

    console.log(`[Evolution API] Sending to ${cleanNumber} via instance ${EVOLUTION_INSTANCE}`);

    const body = {
        number: cleanNumber,
        text: String(text),
        linkPreview: true
    };

    console.log(`[Evolution API] Payload:`, JSON.stringify(body));

    try {
        const response = await axios.post(url, body, {
            headers: {
                'Content-Type': 'application/json',
                'apikey': EVOLUTION_API_KEY
            }
        });

        console.log("[Evolution API] Success:", response.data?.key?.id || "Message Sent");
        return response.data;
    } catch (error) {
        const errorData = error.response ? error.response.data : error.message;
        console.error("[Evolution API] FAILURE:", JSON.stringify(errorData, null, 2));
        throw new Error(`Evolution API Error: ${JSON.stringify(errorData)}`);
    }
}
