const { PREFIX } = require(`${BASE_DIR}/config`);

module.exports = {
  name: "calendario",
  description: "Mostra a data actual e dias restantes até o ano novo",
  commands: ["calendario", "cale"],
  usage: `${PREFIX}calendario`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
handle: async (m, { conn }) => {
  const hoje = new Date();
  const dataFormatada = hoje.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const anoAtual = hoje.getFullYear();
  const anoNovo = new Date(`anoAtual + 1-01-01`);
  const diffDias = Math.ceil((anoNovo - hoje) / (1000 * 60 * 60 * 24));

  const resposta =
    `📅 *Data de hoje:*{dataFormatada}\n` +
    `🎉 *Faltam:* ${diffDias} dias para o Ano Novo!`;

  await conn.sendMessage(m.chat, { text: resposta });
 }
};