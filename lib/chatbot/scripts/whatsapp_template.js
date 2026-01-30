import axios from 'axios';

// Using environment variables for security
const YCLOUD_API_KEY = process.env.YCLOUD_API_KEY;
const FROM_NUMBER = process.env.WHATSAPP_PHONE_NUMBER_ID;

/**
 * Sends a WhatsApp message via YCloud.
 * @param {string} phoneNumber - Recipient number with country code.
 * @param {string} message - The message text.
 */
export async function sendWhatsAppMessage(phoneNumber, message) {
    const url = 'https://api.ycloud.com/v1/whatsapp/messages';

    // Formatting phoneNumber to YCloud standards (removing + and spaces)
    const formattedNumber = phoneNumber.replace('+', '').replace(/\s/g, '');

    console.log(`[YCloud Output] Sending to ${formattedNumber} from ID ${FROM_NUMBER}`);

    try {
        if (!YCLOUD_API_KEY) throw new Error("YCLOUD_API_KEY is missing.");
        if (!FROM_NUMBER) throw new Error("WHATSAPP_PHONE_NUMBER_ID is missing.");

        const response = await axios.post(url, {
            from: FROM_NUMBER,
            to: formattedNumber,
            type: "text",
            text: { body: message }
        }, {
            headers: {
                'X-API-Key': YCLOUD_API_KEY,
                'Content-Type': 'application/json'
            }
        });
        console.log("[YCloud Output] Success:", response.data.id);
        return response.data;
    } catch (error) {
        const errorData = error.response ? error.response.data : error.message;
        console.error("[YCloud Output] FAILURE Details:", JSON.stringify(errorData, null, 2));

        // Don't kill the whole process if only one message fails, but we throw for the webhook to report it
        throw new Error(`YCloud Error: ${JSON.stringify(errorData)}`);
    }
}
