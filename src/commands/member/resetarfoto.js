const fs = require("fs");
const path = require("path");
const configPath = path.join(__dirname, "../../../storage/antifoto.json");

module.exports = {
  commands: ["resetarfoto"],
  description: "Remove o grupo da lista do antifoto",
  type: "member",

  handle: async ({ remoteJid, sendSuccessReply }) => {
    if (!fs.existsSync(configPath)) return sendSuccessReply("Nada para resetar.");

    let config = JSON.parse(fs.readFileSync(configPath));
    delete config[remoteJid];

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    await sendSuccessReply("🔄 CONFIGURAÇÃO DE ANTIFOTO RESETADA.");
  },
};