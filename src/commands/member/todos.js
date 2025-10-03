/**
 * Comando !todos
 * Apaga a mensagem original do admin
 * Envia o texto limpo com menção de todos (hidetag)
 */

module.exports = {
  name: "todos",
  description: "Marca todos com uma mensagem personalizada.",
  commands: ["todos"],
  usage: "!todos SUA MENSAGEM AQUI",

  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({
    sendSuccessReply,
    sendErrorReply,
    react,
    remoteJid,
    isGroup,
    args,
    getGroupParticipants,
    webMessage,
    deleteMessage
  }) => {
    try {
      // Verifica se está em grupo
      if (!isGroup) {
        await sendErrorReply("ESTE COMANDO SÓ FUNCIONA EM GRUPOS!");
        if (react) await react("❌");
        return;
      }

      // Verifica se tem mensagem
      if (!args || args.length < 1) {
        await sendErrorReply("USE O FORMATO: !todos SUA MENSAGEM AQUI");
        if (react) await react("❌");
        return;
      }

      // Reage recebendo o comando
      if (react) await react("🛎️");

      // Monta o texto enviado
      const texto = args.join(" ").trim();
      if (!texto) {
        await sendErrorReply("MENSAGEM INVÁLIDA!");
        if (react) await react("❌");
        return;
      }

      // ✅ Tenta apagar a mensagem original
      if (deleteMessage && webMessage && webMessage.key && webMessage.key.id && webMessage.key.remoteJid) {
        try {
          await deleteMessage(webMessage);
        } catch (e) {
          console.warn("Erro ao tentar apagar a mensagem:", e);
        }
      } else {
        console.warn("Não consegui apagar a mensagem: dados incompletos.");
      }

      // Pega todos os participantes
      let mentions = [];
      try {
        if (getGroupParticipants) {
          const participants = await getGroupParticipants(remoteJid);
          if (participants && participants.length > 0) {
            mentions = participants.map(p => p.id);
          }
        }
      } catch (e) {
        console.error("erro ao pegar participantes:", e);
      }

      // Envia a mensagem com mentions (hidetag)
      await sendSuccessReply(texto, mentions);

      // Reage com sucesso
      if (react) await react("✅");

    } catch (err) {
      console.error("ERRO NO COMANDO TODOS:", err);
      await sendErrorReply("RRO AO ENVIAR A MENSAGEM.");
      if (react) await react("❌");
    }
  },
};