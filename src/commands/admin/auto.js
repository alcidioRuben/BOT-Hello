const { PREFIX } = require(`${BASE_DIR}/config`);
const { errorLog }  = require(`${BASE_DIR}/utils/logger`);
 
const delay = ms => new Promise(resolve => setTimeout(resolve,ms));

module.exports = {
  name: "fechar-auto",
  description: "Fecha o grupo automaticamente após um tempo",
  commands: ["f-auto", "auto-fechar", "autoclose"],
  usage: `${PREFIX}fechar-auto <segundos>`,

  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ socket, args, remoteJid, sendReply, sendErrorReply, sendSuccessReply }) => {
    if (!args[0] || isNaN(args[0])) {
      return await sendReply("⏱️ *Uso:* /fechar-auto 30\n(Fecha o grupo em 30 minutos)");
    }

    const minutos = parseInt(args[0]); 
const tempo = minutos * 60 * 1000; // converte minutos para milissegundos

    try {
      await sendReply(`⏳ O grupo será fechado em ${args[0]} minutos...`);
      await delay(tempo);
      await socket.groupSettingUpdate(remoteJid, "announcement");
      await sendSuccessReply("🔒 Grupo fechado automaticamente!");
    } catch (err) {

await sendReply("❌ Erro ao tentar fechar o grupo.");
      console.error("Erro real :", err); 
await sendErrorReply(`erro ao fechar o grupo : {err.message}`);
    }
  },
};