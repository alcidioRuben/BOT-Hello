const fs = require("fs");
const filePath = "./storage/systems.json";

exports.commands = ["compras", "ativarcompras"];
exports.description = "Ativa ou desativa o sistema de compras";

exports.handle = async ({ args, remoteJid, isGroup, sendReply, sendReact }) => {
  if (!isGroup) {
    await sendReact("☠️");
    return sendReply("❌ Esse comando só funciona em grupos.");
  }

  if (!args.length) {
    await sendReact("☠️");
    return sendReply("❌ Use: .compras on | off");
  }

  const option = args[0].toLowerCase();

  if (!["on", "off"].includes(option)) {
    await sendReact("☠️");
    return sendReply("❌ Use: .compras on | off");
  }

  let data = {};
  if (fs.existsSync(filePath)) {
    data = JSON.parse(fs.readFileSync(filePath));
  }

  if (!data[remoteJid]) data[remoteJid] = {};

  data[remoteJid].compras = option === "on";

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

  await sendReact("✅");
  return sendReply(`✅ Sistema de compras foi ${option === "on" ? "ativado" : "desativado"}.`);
};