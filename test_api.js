import axios from 'axios';

const EVOLUTION_API_URL = "http://178.238.238.158:8080";
const EVOLUTION_API_KEY = "42a447c1-3d74-4b52-9571-042c174f7621";
const EVOLUTION_INSTANCE = "Odontologa";

async function test() {
    const url = `${EVOLUTION_API_URL}/message/sendText/${EVOLUTION_INSTANCE}`;
    const body = {
        number: "593967491847",
        text: "Test message",
        linkPreview: false
    };
    
    console.log("URL:", url);
    console.log("Body:", JSON.stringify(body));
    console.log("Headers:", { 'Content-Type': 'application/json', 'apikey': EVOLUTION_API_KEY });
    
    try {
        const response = await axios.post(url, body, {
            headers: {
                'Content-Type': 'application/json',
                'apikey': EVOLUTION_API_KEY
            }
        });
        console.log("SUCCESS:", response.data);
    } catch (error) {
        console.log("ERROR:", error.response?.data || error.message);
    }
}

test();