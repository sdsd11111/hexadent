var mysql = require('mysql2/promise');
var axios = require('axios');
mysql.createConnection({
    host: 'mysql.us.stackcp.com',
    port: 43192,
    user: 'pdfs-texto-3139329864',
    password: '9f4j6r1lml',
    database: 'pdfs-texto-3139329864'
}).then(function(conn) {
    var metadata = JSON.stringify({
        awaiting_confirmation: {
            appointmentId: 127,
            date: "2026-06-22",
            time: "23:30:00",
            patientName: "Test"
        }
    });
    return conn.execute(
        "INSERT INTO chatbot_sessions (phone, current_flow, metadata) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE current_flow = ?, metadata = ?",
        ["0967491847", "awaiting_confirmation", metadata, "awaiting_confirmation", metadata]
    ).then(function() {
        console.log("✓ Contexto guardado");
    });
}).then(function() {
    // Enviar mensaje via Evolution API
    var msgData = {
        number: "593967491847",
        text: "¡Hola! 👋 Te recordamos tu cita en *Hexadent* para hoy 22 de junio a las *23:30*. \n\n¿Confirmas tu asistencia? (Responde SÍ o NO). *Si respondes NO, tu cita se cancelará automáticamente.*",
        linkPreview: false
    };
    return axios.post("http://178.238.238.158:8080/message/sendText/Odontologa", msgData, {
        headers: { "apikey": "42a447c1-3d74-4b52-9571-042c174f7621" }
    });
}).then(function(r) {
    console.log("✓ Mensaje enviado");
    console.log(r.data);
    process.exit(0);
}).catch(function(err) {
    console.error("Error:", err.message);
    process.exit(1);
});