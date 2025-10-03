const { getDadosUser } = require("../../../storage/compras");

module.exports = {
  name: "limparrestanas",
  description: "Remove até 5 membros que não têm nenhuma compra registrada.",
  type: "admin",

  handle: async ({ socket, remoteJid, sendSuccessReply, sendErrorReply }) => {
    try {
      const groupMetadata = await socket.groupMetadata(remoteJid);
      if (!groupMetadata || !groupMetadata.participants)
        return await sendErrorReply("❌ Não foi possível obter os dados do grupo.");

      let removidos = 0;

      for (const participante of groupMetadata.participants) {
        if (removidos >= 5) break;

        const userId = participante.id;
        const dados = getDadosUser(remoteJid, userId);
        const totalComprado = dados?.total || 0;

        if (totalComprado === 0) {
          await socket.groupParticipantsUpdate(remoteJid, [userId], "remove");
          removidos++;
          await new Promise(resolve => setTimeout(resolve, 2000)); // Evita spam (2s entre remoções)
        }
      }

      if (removidos > 0) {
      await sendSuccessReply(`✅ Removidos ${removidos} membros sem compras.`);
      } else {
        await sendSuccessReply(`🎉 Nenhum membro para remover. Todos têm compras.`);
      }

    } catch (error) {
      await sendErrorReply("❌ Erro ao executar o comando!");
      console.error("ERRO EM limparrestanas:", error);
    }
  }
};
