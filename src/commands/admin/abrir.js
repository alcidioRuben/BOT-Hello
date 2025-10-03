const { PREFIX } = require(`${BASE_DIR}/config`);
const { errorLog } = require(`${BASE_DIR}/utils/logger`);

module.exports = {
  name: "abrir",
  description: "Abre o grupo com ou sem motivo.",
  commands: [
    "abrir",
    "abri",
    "abre",
    "abrir-grupo",
    "abre-grupo",
    "open",
    "open-group",
  ],
  usage: `${PREFIX}abrir [motivo]`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ socket, remoteJid, args, sendSuccessReply, sendErrorReply }) => {
    try {
      const motivo = args.length > 0 ? args.join(" ") : null;

      await socket.groupSettingUpdate(remoteJid, "not_announcement");

      if (motivo) {
        await sendSuccessReply(`*GRUPO ABERTO!*\n 💨 ${motivo.toUpperCase()}`);
      } else {
        await sendSuccessReply("*GRUPO ABERTO!*");
      }

    } catch (error) {
      await sendErrorReply(
        "PARA ABRIR O GRUPO, EU PRECISO SER ADMINISTRADOR DELE!"
      );
      errorLog(
        `OCORREU UM ERRO AO ABRIR O GRUPO! CAUSA: ${JSON.stringify(error, null, 2)}`
      );
    }
  },
};