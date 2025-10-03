const { PREFIX } = require(`${BASE_DIR}/config`);

module.exports = {
  name: "comunicar",
  description: "Marca todos com uma mensagem e apaga a original",
  commands: ["comunicar", "sms"],
  usage: `${PREFIX}comunicar mensagem`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ fullArgs, sendText, socket, remoteJid, webMessage }) => {
    if (!fullArgs || fullArgs.length === 0)
      return sendText("❌ Escreva uma mensagem!\nEx: .comunicar Atenção!");

    const texto = Array.isArray(fullArgs) ? fullArgs.join(" ") : fullArgs;
    const { participants } = await socket.groupMetadata(remoteJid);
    const mentions = participants.map(p => p.id);

    // Apagar a mensagem original
    await socket.sendMessage(remoteJid, {
  delete: {
    remoteJid: remoteJid,
    id: webMessage.key.id,
    participant: webMessage.key.participant || webMessage.key.remoteJid,
  },
});

    // Enviar a nova mensagem marcando todos
    await sendText(texto, mentions);
  },
};

