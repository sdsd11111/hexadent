import { processChatbotMessage } from './logic';

// Map of phone -> { messages: [], timer: null }
const pendingMessages = new Map();
const DEBOUNCE_WAIT = 15000; // 15 seconds

export async function debounceMessage(phoneNumber, text, clinicNumber) {
    const cleanPhone = phoneNumber.replace(/\D/g, '');

    if (!pendingMessages.has(cleanPhone)) {
        pendingMessages.set(cleanPhone, { messages: [], timer: null });
    }

    const state = pendingMessages.get(cleanPhone);
    state.messages.push(text);

    // Clear existing timer
    if (state.timer) {
        clearTimeout(state.timer);
    }

    // Set new timer
    state.timer = setTimeout(async () => {
        const fullMessage = state.messages.join('\n');
        console.log(`[Debouncer] Processing grouped message for ${cleanPhone}: "${fullMessage}"`);

        // Reset state before processing to allow new messages to start a new queue
        pendingMessages.delete(cleanPhone);

        try {
            await processChatbotMessage(phoneNumber, fullMessage, clinicNumber);
        } catch (error) {
            console.error(`[Debouncer] Error processing message for ${cleanPhone}:`, error);
        }
    }, DEBOUNCE_WAIT);
}
