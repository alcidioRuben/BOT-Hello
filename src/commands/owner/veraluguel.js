const { PREFIX } = require(`${BASE_DIR}/config`);
const fs = require('fs');
const path = './database/alugueis.json';

module.exports = {
  name: "veraluguel",
  description: "Mostra quanto tempo falta para o aluguel do bot acabar",
  commands: ["veraluguel", "ver"],
  usage: `${PREFIX}veraluguel responda a msg da pessoa`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ webMessage, sendText }) => {
    const mention = webMessage?.message?.extendedTextMessage?.contextInfo?.participant;

    if (!mention) return await sendText("❌ Responda à mensagem de quem alugou o bot.");

    if (!fs.existsSync(path)) return await sendText("📂 Nenhum registro de aluguel encontrado.");

    const db = JSON.parse(fs.readFileSync(path));

    const expiracao = db[mention];

    if (!expiracao) return await sendText("⛔ Esta pessoa não tem aluguel ativo.");

    const hoje = new Date();
    const fim = new Date(expiracao);
    const diff = fim - hoje;

    if (diff <= 0) return await sendText("⌛ O aluguel dessa pessoa já expirou.");

    const diasRestantes = Math.ceil(diff / (1000 * 60 * 60 * 24));

    await sendText(`📅 Aluguel ativo!\n👤 Pessoa: @mention.split('@')[0]⏳ Restam: *{diasRestantes} dias*`, [mention]);
  },
};