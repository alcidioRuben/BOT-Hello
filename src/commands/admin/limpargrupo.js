const { PREFIX } = require(`${BASE_DIR}/config`);

module.exports = {
  name: "limpargrupo",
  description: "Apaga todas as mensagens do grupo",
  commands: [".limpargrupo", "limgroup"],
  usage: `${PREFIX}limpargrupo`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  async handle({ sock, command, remoteJid, participants, sendWarningReply }) {
    
    const participantJids = participants.map(p => p.id).filter(id => id !== sock.user.id);

    try {
      for (const jid of participantJids) {
        await sock.sendMessage(remoteJid, {
          delete: {
            remoteJid,
            fromMe: false,
            id: "",
            participant: jid,
          },
        });
      }

      await sock.sendMessage(remoteJid, { text: "🧹 Todas as mensagens foram apagadas com sucesso (visíveis para você)." });
    } catch (e) {
      console.error("Erro ao apagar mensagens:", e);
      await sendWarningReply("❌ Ocorreu um erro ao tentar apagar as mensagens.");
    }
  },
};

