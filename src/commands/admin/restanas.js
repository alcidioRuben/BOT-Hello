const { getDadosUser } = require("../../../storage/compras");
const { PREFIX } = require(`${BASE_DIR}/config`);
const { errorLog } = require(`${BASE_DIR}/utils/logger`);

module.exports = {
  name: "restanas",
  description: "Marca todos que ainda não têm nenhuma compra registrada.",
  commands: ["restanas", "semcompra", "faltacompra"],
  usage: `${PREFIX}restanas`,
  type: "admin",

  handle: async ({ socket, remoteJid, sendSuccessReply, sendErrorReply, sendReact, quoted }) => {
    try {
      const groupMetadata = await socket.groupMetadata(remoteJid);

      if (!groupMetadata || !groupMetadata.participants) {
        await sendReact("❌");
        return await sendErrorReply("🤖 ❌ ERRO: INFORMAÇÕES DO GRUPO NÃO DISPONÍVEIS.");
      }

      const semCompras = [];
      const mentions = [];

      for (const participante of groupMetadata.participants) {
        const userId = participante.id;

        const dados = getDadosUser(remoteJid, userId);
        const totalComprado = dados?.total ?? 0;

        if (totalComprado <= 0) {
          semCompras.push(`- @${userId.split("@")[0]} `);
          mentions.push(userId);
        }
      }

      if (semCompras.length === 0) {
        await sendReact("✅");
        return await sendSuccessReply("🤖 ✅ Todos membros têm pelo menos uma compra registrada.");
      }

      const resposta = `⚠️ *Membros sem compras registradas⤵️:*\n\n${semCompras.join("\n")}`;

      await sendReact("⚠️");
      await socket.sendMessage(remoteJid, {
        text: resposta,
        mentions,
      }, { quoted });

    } catch (error) {
      await sendReact("❌");
      await sendErrorReply("🤖 ❌ Erro ao executar o comando!");
      console.log("❌ ERRO EM .restanas:", error);
      errorLog(`ERRO AO EXECUTAR .restanas: ${JSON.stringify(error, null, 2)}`);
    }
  },
};