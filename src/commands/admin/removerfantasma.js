const { getDadosUser } = require("../../../storage/compras");
const { PREFIX } = require(`${BASE_DIR}/config`);
const { errorLog } = require(`${BASE_DIR}/utils/logger`);

module.exports = {
  name: "rfantasmas5",
  description: "Remove até 5 clientes que ainda não têm nenhuma compra registrada.",
  commands: ["rfantasmas5", "remover5", "tirar5"],
  usage: `${PREFIX}rfantasmas5`,
  type: "admin",

  handle: async ({ socket, remoteJid, sendSuccessReply, sendErrorReply, sendReact, quoted }) => {
    try {
      const groupMetadata = await socket.groupMetadata(remoteJid);

      if (!groupMetadata || !groupMetadata.participants) {
        await sendReact("❌");
        return await sendErrorReply("🤖❌ ERRO: Não consegui obter informações do grupo!");
      }

      // pega o ID real do bot (normalizado)
      const myId = (socket.user?.id || socket.user?.jid || socket.user?.wa_id || "").split(":")[0];

      // encontra o bot na lista de participantes
      const me = groupMetadata.participants.find(
        p => p.id?.split(":")[0] === myId || p.jid?.split(":")[0] === myId
      );

      // verifica admin (aceita diferentes formatos retornados pela lib)
      const botIsAdmin = !!(
        me &&
        (
          me.admin === "admin" ||
          me.admin === "superadmin" ||
          me.isAdmin === true ||
          me.isSuperAdmin === true
        )
      );

      if (!botIsAdmin) {
        await sendReact("❌");
        return await sendErrorReply("🤖❌ O bot precisa ser administrador do grupo para remover participantes.");
      }

      // pega membros sem compras
      const semComprasIds = [];
      for (const participante of groupMetadata.participants) {
        const userId = participante.id || participante.jid;
        const dados = getDadosUser(remoteJid, userId);
        const totalComprado = Number(dados?.total ?? 0);

        if (totalComprado <= 0) {
          semComprasIds.push(userId);
        }
      }

      if (semComprasIds.length === 0) {
        await sendReact("✅");
        return await sendSuccessReply("🤖✅ Todos os membros têm pelo menos uma compra registrada.");
      }

      // pega só os primeiros 5
      const toRemove = semComprasIds.slice(0, 5);

      const removed = [];
      const failed = [];

      for (const userId of toRemove) {
        try {
          const target = groupMetadata.participants.find(
            p => p.id === userId || p.jid === userId
          );

          // não remove administradores
          const targetIsAdmin = !!(
            target &&
            (
              target.admin === "admin" ||
              target.admin === "superadmin" ||
              target.isAdmin === true ||
              target.isSuperAdmin === true
            )
          );

          if (targetIsAdmin) {
            failed.push({ userId, reason: "é administrador" });
            continue;
          }

          await socket.groupParticipantsUpdate(remoteJid, [userId], "remove");
          removed.push(userId);
        } catch (err) {
          failed.push({ userId, reason: err.message || String(err) });
          console.error("Erro ao remover", userId, err);
          errorLog(`Erro ao remover ${userId} em ${remoteJid}: ${err.stack || JSON.stringify(err)}`);
        }
      }

      await sendReact("✅");
      let resposta = `🤖✅ Removi ${removed.length} membro(s) sem compras do grupo.`;
      if (failed.length) {
        resposta += `\n⚠️ Não consegui remover ${failed.length}:\n` +
          failed.map(f => `- ${f.userId.split("@")[0]} (${f.reason})`).join("\n");
      }
      return await sendSuccessReply(resposta);

    } catch (error) {
      await sendReact("❌");
      await sendErrorReply("🤖❌ Erro ao executar o comando!");
      console.error("❌ ERRO EM rfantasmas5:", error);
      errorLog(`ERRO AO EXECUTAR rfantasmas5: ${JSON.stringify(error, null, 2)} `);
    }
  },
};

