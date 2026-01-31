import axios from 'axios';

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

/**
 * Sends a WhatsApp message via Meta Cloud API.
 * @param {string} phoneNumber - Recipient number.
 * @param {string} message - The message text.
 */
export async function sendWhatsAppMessage(phoneNumber, message) {
    if (!WHATSAPP_TOKEN || !PHONE_NUMBER_ID) {
        console.error("[WhatsApp Meta] Missing configuration: TOKEN or PHONE_ID");
        throw new Error("Meta API configuration missing.");
    }

    const url = `https://graph.facebook.com/v17.0/${PHONE_NUMBER_ID}/messages`;

    // Ensure phoneNumber starts with + and has no spaces (E.164 standard)
    let formattedNumber = phoneNumber.replace(/\s/g, '').replace(/\+/g, '');

    console.log(`[WhatsApp Meta] Sending to ${formattedNumber}`);

    try {
        const response = await axios.post(url, {
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: formattedNumber,
            type: "text",
            text: { body: message }
        }, {
            headers: {
                'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        console.log("[WhatsApp Meta] Success:", response.data.messages?.[0]?.id);
        return response.data;
    } catch (error) {
        const errorData = error.response ? error.response.data : error.message;
        console.error("[WhatsApp Meta] FAILURE Details:", JSON.stringify(errorData, null, 2));
        throw new Error(`Meta API Error: ${JSON.stringify(errorData)}`);
    }
}
