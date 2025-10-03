const fs = require("fs");
const path = require("path");

const comprasPath = path.join(__dirname, "../../../storage/compras.json");

module.exports = {
  commands: ["limparcompras"],
  alias: [],
  description: "Limpa os registros de compras apenas do grupo atual",
  category: "admin",

  async handle({ remoteJid, sendSuccessReply, sendWarningReply, sendErrorReply }) {
    try {
      let compras = {};

      if (fs.existsSync(comprasPath)) {
        compras = JSON.parse(fs.readFileSync(comprasPath));
      }

      if (compras[remoteJid]) {
        delete compras[remoteJid];
        fs.writeFileSync(comprasPath, JSON.stringify(compras, null, 2));
        await sendSuccessReply("AS COMPRAS DESTE GRUPO FORAM REMOVIDAS COM SUCESSO!");
      } else {
        await sendWarningReply(" ESTE GRUPO NÃO POSSUI COMPRAS REGISTRADAS!");
      }
    } catch (error) {
      console.error("Erro ao limpar compras:", error);
      await sendErrorReply("ERRO AO LIMPAR AS COMPRAS DO GRUPO!");
    }
  },
};