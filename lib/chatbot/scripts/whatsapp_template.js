/**
 * WhatsApp API integration using YCloud.
 * This script is configured for the Hexadent project.
 */

const axios = require('axios');

// Using environment variables for security
const YCLOUD_API_KEY = process.env.YCLOUD_API_KEY;
const FROM_NUMBER = process.env.WHATSAPP_PHONE_NUMBER_ID;

/**
 * Sends a WhatsApp message via YCloud.
 * @param {string} phoneNumber - Recipient number with country code (e.g., 593983237491).
 * @param {string} message - The message text.
 */
async function sendWhatsAppMessage(phoneNumber, message) {
    const url = 'https://api.ycloud.com/v1/whatsapp/messages';

    // Formatting phoneNumber to YCloud standards
    const formattedNumber = phoneNumber.replace('+', '').replace(/\s/g, '');

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
        console.log("Message sent via YCloud:", response.data);
        return response.data;
    } catch (error) {
        console.error("YCloud API Error:", error.response ? error.response.data : error.message);
        throw error;
    }
}

module.exports = { sendWhatsAppMessage };
