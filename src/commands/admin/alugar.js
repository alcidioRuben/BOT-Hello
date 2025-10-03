const { PREFIX } = require(`${BASE_DIR}/config`);
const fs = require("fs");
const path = require("path");

const aluguelPath = path.join(__dirname, "../../../database/aluguéis.json");

module.exports = {
  name: "alugar",
  description: "Registra dias de aluguel para um membro",
  commands: ["alugar", "al"],
  usage: `${PREFIX}alugar @usuario 7`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ mentionedJidList, args, sendText }) => {
    if (!mentionedJidList || mentionedJidList.length === 0 || args.length < 2) {
      return await sendText("❌ Use o comando assim: .alugar @usuário 7");
    }

    const dias = parseInt(args[1]);
    if (isNaN(dias) || dias < 1) {
      return await sendMessage("❌ Quantidade de dias inválida.");
    }

    const jid = mentionedJidList[0];
    let db = {};

    if (fs.existsSync(aluguelPath)) {
      db = JSON.parse(fs.readFileSync(aluguelPath));
    }

    const hoje = new Date();
    const vencimento = new Date(hoje.setDate(hoje.getDate() + dias));

    db[jid] = vencimento.toISOString();

    fs.writeFileSync(aluguelPath, JSON.stringify(db, null, 2));

    await sendMessage(`✅ Aluguel registrado com sucesso por *${dias} dias*!`);
  }
};

