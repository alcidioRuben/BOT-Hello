const fs = require("fs");
const path = require("path");
const alarmePath = path.join(__dirname, "../../../storage/alarmes.json");

module.exports = {
  commands: ["adalarme", "alarme"],
  category: "group",
  description: "Define horário de abrir e fechar o grupo automaticamente",
  async handle({ args, remoteJid, isGroupAdmin, sendSuccessReply, sendWarningReply }) {
    if (!isGroupAdmin) return sendWarningReply("❌ Apenas admins podem definir alarmes.");

    if (args.length !== 2) return sendWarningReply("⏰ Use: .setalarme HH:MM HH:MM");

    const [horaAbrir, horaFechar] = args;

    const regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!regex.test(horaAbrir) || !regex.test(horaFechar)) {
      return sendWarningReply("❌ Horário inválido! Use formato HH:MM");
    }

    let alarmes = {};
if (fs.existsSync(alarmePath)) 
      alarmes = JSON.parse(fs.readFileSync(alarmePath));
    

    alarmes[remoteJid] =  horaAbrir, horaFechar ;

    fs.writeFileSync(alarmePath, JSON.stringify(alarmes, null, 2));

    await sendSuccessReply(`✅ Alarme configurado!🟢 Abre:{horaAbrir}\n🔴 Fecha: ${horaFechar}`);
  },
};

