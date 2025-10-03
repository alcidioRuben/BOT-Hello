const { PREFIX } = require("../../config");

module.exports = {
  commands: ["addgp", "adicionar"],
  type: "admin",
  description: "Adiciona um número ao grupo",

  /**
   * Exemplo de uso:
   * .addgp 852800194
   */
  handle: async ({ args, socket, remoteJid, sendReply, sendSuccessReply }) => {
    try {
      const numero = args[0];

      if (!numero) {
        await sendReply("FORMATO INVÁLIDO!\n\nUse: *.addgp <número sem +>*");
        return;
      }

      const id = numero.replace(/[^0-9]/g, "") + "@s.whatsapp.net";

      await socket.groupParticipantsUpdate(remoteJid, [id], "add");

      await sendSuccessReply(`Número adicionado com sucesso: wa.me/${numero}`);
    } catch (error) {
      console.error("Erro ao adicionar número:", error);
      await sendReply("Erro ao adicionar número. Verifique se o número está correto e se o bot tem permissão.");
    }
  },
};