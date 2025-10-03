const fs = require("fs");
const path = require("path");

const SMS_PATH = "/sdcard/data/com.termux/file.txt"; // Arquivo monitorado pelo app que exporta SMS
const DESTINO = path.join(__dirname, "data/sms/mensagens.json");

let ultimaLeitura = "";

function lerSMS() {
  if (!fs.existsSync(SMS_PATH)) return;

  const conteudo = fs.readFileSync(SMS_PATH, "utf8").trim();

  if (conteudo && conteudo !== ultimaLeitura) {
    ultimaLeitura = conteudo;

    // Tenta carregar mensagens existentes
    let mensagens = [];
    try {
      mensagens = JSON.parse(fs.readFileSync(DESTINO));
    } catch {}

    mensagens.push({
      mensagem: conteudo,
      timestamp: new Date().toISOString()
    });

    fs.writeFileSync(DESTINO, JSON.stringify(mensagens, null, 2));
    console.log("📩 Nova mensagem armazenada!");
  }
}

setInterval(lerSMS, 20000); // A cada 20 segundos
