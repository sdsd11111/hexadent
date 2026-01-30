import axios from 'axios';

// Using environment variables for security
const YCLOUD_API_KEY = process.env.YCLOUD_API_KEY;
const FROM_NUMBER = process.env.WHATSAPP_PHONE_NUMBER_ID;

/**
 * Sends a WhatsApp message via YCloud.
 * @param {string} phoneNumber - Recipient number with country code (e.g., 593983237491).
 * @param {string} message - The message text.
 */
export async function sendWhatsAppMessage(phoneNumber, message) {
    const url = 'https://api.ycloud.com/v1/whatsapp/messages';

    // Formatting phoneNumber to YCloud standards
    const formattedNumber = phoneNumber.replace('+', '').replace(/\s/g, '').replace(/^0/, '593');

    console.log(`[YCloud] Attempting to send message to ${formattedNumber} using ID ${FROM_NUMBER}`);

    try {
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
        console.log("[YCloud] Message sent successfully:", response.data);
        return response.data;
    } catch (error) {
        const errorData = error.response ? error.response.data : error.message;
        console.error("[YCloud] API Error:", JSON.stringify(errorData, null, 2));

        // Detailed log to identify if ID is the issue
        if (errorData?.error?.message?.includes("from")) {
            console.error("[YCloud] Tip: The WHATSAPP_PHONE_NUMBER_ID seems to be incorrect. Check your YCloud Dashboard.");
        }

        throw error;
    }
}
