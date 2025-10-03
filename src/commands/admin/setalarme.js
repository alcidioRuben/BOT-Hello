const fs = require("fs");
const path = require("path");

const alarmePath = path.join(__dirname, "../../../storage/alarmes.json");

module.exports = {
  commands: ["alarme", "setalarme"],
  alias: [],
  description: "Define horários para abrir e fechar o grupo automaticamente",
  category: "group",

  async handle({ args, remoteJid, isGroupMember, sendSuccessReply, sendErrorReply, sendWarningReply }) {
    try {
      if (!isGroupAdmin) {
        return await sendWarningReply("⚠️ Atenção! ❌ Apenas admins podem definir alarmes.");
      }

      if (args.length !== 2 || !args[0].match(/^2̣:2̣/) || !args[1].match(/^2̣:2̣/)) {
        return await sendWarningReply("❗ Formato inválido. Use: .alarme HH:MM HH:MM\nExemplo: .alarme 06:00 22:00");
      }

      const [abrir, fechar] = args;

      // Verifica se arquivo existe, senão cria
      let alarmes = {};
      if (fs.existsSync(alarmePath)) {
        alarmes = JSON.parse(fs.readFileSync(alarmePath));
      }
alarmes[remoteJid] = { abrir, fechar };
      fs.writeFileSync(alarmePath, JSON.stringify(alarmes, null, 2));

      await sendSuccessReply(`✅ Alarme definido com sucesso!\n🟢 Abrir: abrir🔴 Fechar:{fechar}`);
    } catch (err) {
      console.error("Erro no comando alarme:", err);
      await sendErrorReply("❌ Ocorreu um erro ao definir o alarme.");
    }
  }
};