const fs = require("fs");
const path = require("path");

module.exports = {
  commands: ["verificarsms", "verificar"],
  description: "Verifica as últimas mensagens SMS do M-Pesa e E-Mola",

  handle: async ({ remoteJid, isGroup, sender, sendReply }) => {
    if (isGroup) return sendReply("❌ Este comando só pode ser usado no PV.");

    const DESTINO = path.join(__dirname, "../../../data/sms/mensagens.json");

    if (!fs.existsSync(DESTINO)) {
      return sendReply("❌ Nenhuma mensagem armazenada.");
    }

    const mensagens = JSON.parse(fs.readFileSync(DESTINO));
    if (mensagens.length === 0) {
      return sendReply("❌ Nenhuma mensagem armazenada.");
    }

    const ultimas = mensagens.slice(-5).map((msg, i) =>
      `📩 ${i + 1}. ${msg.mensagem}\n🕒 ${msg.timestamp}`
    ).join("\n\n");

    await sendReply("📥 Últimas mensagens recebidas:\n\n" + ultimas);
  },
};
