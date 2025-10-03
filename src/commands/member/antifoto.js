const fs = require("fs");
const path = require("path");
const configPath = path.join(__dirname, "../../../storage/antifoto.json");

module.exports = {
  commands: ["antifoto"],
  description: "Ativa ou desativa o filtro antifoto no grupo",
  type: "member",

  handle: async ({ args, remoteJid, sendReply, sendSuccessReply }) => {
    const status = args[0]?.toLowerCase();

    if (!["on", "off"].includes(status)) {
      return sendReply("USE: .antifoto on / .antifoto off");
    }

    let config = {};
    if (fs.existsSync(configPath)) {
      config = JSON.parse(fs.readFileSync(configPath));
    }

    if (status === "on") {
      config[remoteJid] = true;
      await sendSuccessReply("ANTIFOTO ATIVADO NESTE GRUPO.");
    } else {
      delete config[remoteJid];
      await sendSuccessReply("ANTIFOTO DESATIVADO NESTE GRUPO.");
    }

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  },
};