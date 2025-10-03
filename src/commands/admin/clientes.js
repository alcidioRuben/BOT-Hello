const fs = require("fs");
const path = require("path");

const comprasPath = path.join(__dirname, "../../../storage/compras.json");

// Função para converter MB para GB e TB
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
  commands: ["clientes"],
  alias: [],
  description: "Lista os clientes com total comprado e ranking (versão 2.3)",
  category: "owner",

  async handle({ remoteJid, sendSuccessReply, sendWarningReply, sendErrorReply }) {
    try {
      if (!fs.existsSync(comprasPath)) {
        return await sendWarningReply("NÃO HÁ REGISTROS DE COMPRAS.");
      }

      const compras = JSON.parse(fs.readFileSync(comprasPath));
      const grupoCompras = compras[remoteJid];

      if (!grupoCompras || Object.keys(grupoCompras).length === 0) {
        return await sendWarningReply("NÃO HÁ COMPRAS REGISTRADAS NESTE GRUPO.");
      }

      // Extrair e ordenar ranking
      const ranking = Object.entries(grupoCompras).map(([userId, dados]) => ({
        userId,
        total: dados.total || 0,
        hoje: dados.hoje || 0,
      }))
      .sort((a, b) => b.total - a.total);

      let mensagem = "🛒 *Lista de Clientes - Ranking por Produto:*\n\n";
      mensagem += "📊 *Ranking de Clientes que compraram MB:*\n\n";

      const mentions = [];

      ranking.forEach((cliente, i) => {
        const { mb, gb, tb, tc } = formatarTamanho(cliente.total);
        const totalCompras = grupoCompras[cliente.userId]?.historico?.length || 0;

        mentions.push(cliente.userId);

        mensagem += `${i + 1}) @${cliente.userId.split('@')[0]}\n`;
        mensagem += `   • _Total MB adquirido:_ ${mb}MB\n`;
        mensagem += `   • _Convertidos:_ ${gb}GB, ${tb}TB\n`;
        mensagem += `   • _Total de compras:_ ${totalCompras}\n`;
      });

      await sendSuccessReply(mensagem, mentions);
    } catch (error) {
      console.error("Erro ao listar clientes:", error);
      await sendErrorReply("ERRO AO BUSCAR A LISTA DE CLIENTES.");
    }
  },
};

