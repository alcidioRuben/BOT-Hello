const { PREFIX } = require(`${BASE_DIR}/config`);
const { activateAntiEstrangeiros } = require(`${BASE_DIR}/utils/database`);

module.exports = {
  name: "antiestrangeiros-on",
  description: "Ativa o anti-estrangeiros no grupo",
  commands: ["antiestrangeiros-on"],
  usage: `${PREFIX}antiestrangeiros-on`,
  handle: async ({ remoteJid, isGroup, sendSuccessReply }) => {
    if (!isGroup) {
      throw new WarningError("Use este comando em um grupo!");
    }

    activateAntiEstrangeiros(remoteJid);
    await sendSuccessReply("Anti-estrangeiros *ativado* neste grupo!");
  },
};
