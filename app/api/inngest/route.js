import { serve } from "inngest/next";
import { inngest } from "../../../lib/inngest/client.js";
import { processChatbotEvent } from "../../../lib/inngest/functions.js";

// Create an API that serves Inngest functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    processChatbotEvent
  ],
});
