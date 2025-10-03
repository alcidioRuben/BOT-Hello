const { PREFIX } = require(`${BASE_DIR}/config`);
const { activateGroup } = require(`${BASE_DIR}/utils/database`);
const { WarningError } = require(`${BASE_DIR}/errors`);

module.exports = {
  name: "on",
  description: "Ativa o bot no grupo (opcionalmente por X dias)",
  commands: ["on"],
  usage: `${PREFIX}on [dias]`,

  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ sendSuccessReply, remoteJid, isGroup, isOwner, args }) => {
    if (!isGroup) {
      throw new WarningError("Este comando deve ser usado dentro de um grupo.");
    }

    if (!isOwner) {
      throw new WarningError("Este comando é exclusivo para o dono do bot.");
    }

    let expiresAt = null;

    if (args.length > 0) {
      const days = parseInt(args[0], 10);
      if (!isNaN(days) && days > 0) {
        const now = new Date();
        now.setDate(now.getDate() + days);
        expiresAt = now.toISOString();
      } else {
        throw new WarningError(`Número de dias inválido.\n✅ Exemplo correto: ${PREFIX}on 3`);
      }
    }

    activateGroup(remoteJid, expiresAt);

    if (expiresAt) {
      await sendSuccessReply(`Bot ativado neste grupo por ${args[0]} dia(s)!`);
    } else {
      await sendSuccessReply("Bot ativado neste grupo sem limite de tempo!");
    }
  },
};