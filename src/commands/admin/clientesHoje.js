const fs = require("fs");
const path = require("path");

const comprasPath = path.join(__dirname, "../../../storage/compras.json");

function formatarTamanho(mb) {
  const gb = mb / 1024;
  const tb = gb / 1024;
  return {
    mb: mb.toFixed(0),
    gb: gb.toFixed(2),
    tb: tb.toFixed(2),
  };
}

module.exports = {
  commands: ["clienteshj", "comprashoje"],
  alias: [],
  description: "Lista os clientes que compraram hoje (ranking diário)",
  category: "owner",

  async handle({ remoteJid, sendSuccessReply, sendWarningReply, sendErrorReply }) {
    try {
      if (!fs.existsSync(comprasPath)) {
        return await sendWarningReply("❌ SEM REGISTROS DE COMPRAS.");
      }

      const compras = JSON.parse(fs.readFileSync(comprasPath));
      const grupoCompras = compras[remoteJid];

      if (!grupoCompras || Object.keys(grupoCompras).length === 0) {
        return await sendWarningReply("❌ NENHUMA COMPRA REGISTRADA HOJE.");
      }

      const rankingHoje = Object.entries(grupoCompras)
        .map(([userId, dados]) => ({
          userId,hoje: dados.hoje || 0,
        }))
        .filter(c => c.hoje > 0)
        .sort((a, b) => b.hoje - a.hoje);

      if (rankingHoje.length === 0) {
        return await sendWarningReply("📭 NINGUÉM COMPROU HOJE AINDA.");
      }

      let mensagem = "📅 *Ranking de Clientes - Compras de Hoje*\n\n";
      const mentions = [];

      rankingHoje.forEach((cliente, i) => {
        const { mb, gb, tb } = formatarTamanho(cliente.hoje);
        mentions.push(cliente.userId);
        mensagem += `🥇 i + 1 @{cliente.userId.split("@")[0]}\n`;
        mensagem += `• Comprou: mbMB ={gb}GB\n\n`;
      });

      await sendSuccessReply(mensagem, mentions);
    } catch (error) {
      console.error("Erro ao buscar lista de compras de hoje:", error);
      await sendErrorReply("❌ ERRO AO BUSCAR CLIENTES DE HOJE.");
    }
  },
};