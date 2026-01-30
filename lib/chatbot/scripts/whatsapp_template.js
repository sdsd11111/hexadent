import axios from 'axios';

// Using environment variables for security
const YCLOUD_API_KEY = process.env.YCLOUD_API_KEY;
const FROM_NUMBER = process.env.WHATSAPP_PHONE_NUMBER_ID;

/**
 * Sends a WhatsApp message via YCloud.
 * @param {string} phoneNumber - Recipient number.
 * @param {string} message - The message text.
 * @param {string} fromOverride - Optional specific Phone Number or ID.
 */
export async function sendWhatsAppMessage(phoneNumber, message, fromOverride = null) {
    const url = 'https://api.ycloud.com/v1/whatsapp/messages';

    // Choose dynamic from (override) or environment default
    const fromId = fromOverride || FROM_NUMBER;

    // Ensure phoneNumber starts with + and has no spaces (E.164 standard)
    let formattedNumber = phoneNumber.replace(/\s/g, '');
    if (!formattedNumber.startsWith('+')) {
        formattedNumber = '+' + formattedNumber;
    }

    // Ensure fromId is clean
    const from = fromId?.toString().trim();

    console.log(`[YCloud Output] Sending to ${formattedNumber} from ID ${from}`);

    try {
        if (!YCLOUD_API_KEY) throw new Error("YCLOUD_API_KEY is missing.");
        if (!from) throw new Error("Sender ID (from) is missing.");

        const response = await axios.post(url, {
            from: from,
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
        throw new Error(`YCloud Error: ${JSON.stringify(errorData)}`);
    }
}
