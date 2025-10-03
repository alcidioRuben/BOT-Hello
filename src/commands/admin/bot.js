const { PREFIX } = require(`${BASE_DIR}/config`);
const { isActiveGroup, getGroupExpiration } = require(`${BASE_DIR}/utils/database`);

module.exports = {
  name: "bot",
  description: "Mostra status do bot neste grupo",
  commands: ["bot"],
  usage: `${PREFIX}bot`,
  
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ sendSuccessReply, sendWarningReply, sendErrorReply, remoteJid, isGroup }) => {
    if (!isGroup) {
      return sendErrorReply("Este comando só pode ser usado em grupos.");
    }

    const ativo = isActiveGroup(remoteJid);

    if (!ativo) {
      await sendWarningReply("Este grupo está desativado! Peça para o dono do grupo ativar o bot!");
      return;
    }

    const expiresAt = getGroupExpiration(remoteJid);
    if (expiresAt) {
      const now = new Date();
      const expirationDate = new Date(expiresAt);
      const diffTime = expirationDate - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays > 0) {
        await sendSuccessReply(` *Plano activo.*\n📆 ${diffDays} dia(s) restantes.`);
      } else {
        await sendWarningReply("Este grupo está desativado! Peça para o dono do grupo ativar o bot!");
      }
    } else {
      await sendSuccessReply("SEM LIMITE DE TEMPO.");
    }
  },
};