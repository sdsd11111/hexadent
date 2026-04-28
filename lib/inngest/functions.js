import { inngest } from "./client.js";
import { processChatbotMessage } from "../chatbot/logic.js";
import db from "../db.js";

export const processChatbotEvent = inngest.createFunction(
  { 
    id: "process-chatbot-message", 
    name: "Process Chatbot Message",
    debounce: {
        key: "event.data.phoneNumber",
        period: "12s"
    },
    triggers: [{ event: "chatbot/message.received" }]
  },
  async ({ event, step }) => {
    const { phoneNumber, text, clinicNumber } = event.data || {};

    if (!phoneNumber) {
        console.warn("[Inngest] Skipping event with missing phoneNumber", event.data);
        return { skipped: true, reason: "missing_phoneNumber" };
    }

    const phoneStr = String(phoneNumber);

    // No longer need manual sleep, debounce handles the 12s window

    // 2. Fetch buffered messages from DB (we still use the buffer to group them)
    // The webhook will always INSERT into buffer before triggering Inngest.
    const [rows] = await db.execute(
        'SELECT id, message FROM chatbot_buffer WHERE phone = ? ORDER BY id ASC',
        [phoneStr.split(':')[0].split('@')[0].replace(/\D/g, '')]
    );

    if (rows.length === 0) return { skipped: true };

    const ids = rows.map(r => r.id);
    const fullMessage = rows.map(r => r.message).join('\n');

    // 3. Clean up the processed IDs from buffer
    await db.execute(`DELETE FROM chatbot_buffer WHERE id IN (${ids.join(',')})`);

    // 4. Run the actual bot logic
    const result = await step.run("execute-bot-logic", async () => {
        return await processChatbotMessage(phoneNumber, fullMessage, clinicNumber);
    });

    return { success: true, result };
  }
);
