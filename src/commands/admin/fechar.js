const { PREFIX } = require(`${BASE_DIR}/config`);
const { errorLog } = require(`${BASE_DIR}/utils/logger`);

module.exports = {
  name: "fechar",
  description: "Fecha o grupo com motivo opcional.",
  commands: [
    "fechar",
    "fecha",
    "fechar-grupo",
    "grupo-f",
    "close",
    "close-group",
  ],
  usage: `${PREFIX}fechar [motivo]`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ socket, remoteJid, sendSuccessReply, sendErrorReply, args }) => {
    try {
      await socket.groupSettingUpdate(remoteJid, "announcement");

      const motivo = args.length > 0 ? args.join(" ") : null;

      if (motivo) {
        await sendSuccessReply(`*GRUPO FECHADO!*"\n📌 ${motivo}`);
      } else {
        await sendSuccessReply("*GRUPO FECHADO!*");
      }

    } catch (error) {
      await sendErrorReply(
        "❌ PARA FECHAR O GRUPO, EU PRECISO SER ADMINISTRADOR DELE!"
      );
      errorLog(
        `OCORREU UM ERRO AO TENTAR FECHAR O GRUPO! CAUSA: ${JSON.stringify(
          error,
          null,
          2
        )}`
      );
    }
  },
};