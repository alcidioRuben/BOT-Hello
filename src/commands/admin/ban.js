const { OWNER_NUMBER } = require("../../config");
const { PREFIX, BOT_NUMBER } = require(`${BASE_DIR}/config`);
const { DangerError, InvalidParameterError } = require(`${BASE_DIR}/errors`);
const { toUserJid, onlyNumbers } = require(`${BASE_DIR}/utils`);

module.exports = {
  name: "ban",
  description: "Removo um membro do grupo",
  commands: ["ban", "kick"],
  usage: `${PREFIX}ban @marcar_membro
  
ou 

${PREFIX}ban (mencionando uma mensagem)`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({
    args,
    isReply,
    socket,
    remoteJid,
    replyJid,
    userJid,
    sendSuccessReply,
    sendErrorReply,
  }) => {
    if (!args.length && !isReply) {
      return sendErrorReply("Você precisa mencionar ou marcar um membro!");
    }

    const memberToRemoveJid = isReply ? replyJid : toUserJid(args[0]);
    const memberToRemoveNumber = onlyNumbers(memberToRemoveJid);

    if (memberToRemoveNumber.length < 7 || memberToRemoveNumber.length > 15) {
      return sendErrorReply("Número inválido!");
    }

    if (memberToRemoveJid === userJid) {
      return sendErrorReply("Você não pode remover você mesmo!");
    }

    if (memberToRemoveNumber === OWNER_NUMBER) {
      return sendErrorReply("Você não pode remover o dono do bot!");
    }

    const botJid = toUserJid(BOT_NUMBER);

    if (memberToRemoveJid === botJid) {
      return sendErrorReply("Você não pode me remover!");
    }

    await socket.groupParticipantsUpdate(
      remoteJid,
      [memberToRemoveJid],
      "remove"
    );

    await sendSuccessReply("*MEMBRO REMOVIDO COM SUCESSO!*");
  },
};