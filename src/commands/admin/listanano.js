const fs = require("fs");
const path = require("path");

const nanoPath = path.join(__dirname, "../../../storage/nano.json");

module.exports = {
  commands: ["listanano"],
  description: "Lista todos os nano comandos deste grupo/chat",
  type: "admin",

  /**
   * @param {{
   *   remoteJid: string,
   *   sendReply: Function,
   *   sendReact: Function
   * }} props
   */
  async handle({ remoteJid, sendReply, sendReact }) {
    try {
      if (!fs.existsSync(nanoPath)) {
        await sendReact("❌");
        await sendReply("NENHUM COMANDO NANO REGISTRADO.");
        return;
      }

      const raw = fs.readFileSync(nanoPath);
      const nanoData = JSON.parse(raw);

      const comandos = nanoData[remoteJid];
      if (!comandos || Object.keys(comandos).length === 0) {
        await sendReact("❌");
        await sendReply("NÃO HÁ NANO COMANDOS SALVOS AQUI.");
        return;
      }

      let mensagem = `*LISTA DE NANO COMANDOS:* 📜\n\n`;

      Object.keys(comandos).forEach((cmd, idx) => {
        mensagem += `${idx + 1}) *${cmd}*\n`;
      });

      await sendReact("✅");
      await sendReply(mensagem.trim());
    } catch (error) {
      console.error(error);
      await sendReact("❌");
      await sendReply("ERRO AO LER OS COMANDOS NANO.");
    }
  },
};
