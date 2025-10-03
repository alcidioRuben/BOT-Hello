const { PREFIX } = require(`${BASE_DIR}/config`);
const { deactivateAntiEstrangeiros } = require(`${BASE_DIR}/utils/database`);

module.exports = {
  name: "antiestrangeiros-off",
  description: "Desativa o anti-estrangeiros no grupo",
  commands: ["antiestrangeiros-off"],
  usage: `${PREFIX}antiestrangeiros-off`,
  handle: async ({ remoteJid, isGroup, sendSuccessReply }) => {
    if (!isGroup) {
      throw new WarningError("Use este comando em um grupo!");
    }

    deactivateAntiEstrangeiros(remoteJid);
    await sendSuccessReply("Anti-estrangeiros *desativado* neste grupo!");
  },
};
