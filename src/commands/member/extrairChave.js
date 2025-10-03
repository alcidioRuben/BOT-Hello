const { PREFIX } = require(`${BASE_DIR}/config`);

module.exports = {
  name: "extrairchave",
  description: "Extrai dados do comprovativo de transferência",
  commands: ["chave", "extrair"],
  usage: `${PREFIX}chave <mensagem do comprovativo>`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ body, sendMessage }) => {
//const comandoChave = async (sock, msg, match) => {
  try {
    const texto = match.input;

    const regex = /Confirmado\s+(\w+)\. Transferiste\s+([\d.]+)MT.*para\s+(\d+)\s*-\s*(.+?)\s+aos\s+(1̣,̣2̣\/1̣,̣2̣\/2̣)\s+as\s+([\d:]+ [APM]{2})/i;
    const resultado = texto.match(regex);

    if (!resultado) {
      return await sock.sendMessage(msg.key.remoteJid, { text: "❌ Não consegui extrair os dados. Verifique o formato." });
    }

    const [, chave, valor, numero, nome, data, hora] = resultado;

    const resposta = `✅ *Comprovativo detectado!*\n\n🔑 *Chave:* chave\n👤 *Destino:* ${nome.trim()}\n📞 *Número:* ${numero}\n💰 *Valor:* ${valor} MT\n📅 *Data:* data⏰ *Hora:*{hora}`;

    await sock.sendMessage(msg.key.remoteJid, { text: resposta });

  } catch (err) {
    console.error(err);
    await sock.sendMessage(msg.key.remoteJid, { text: `❌ Erro ao executar o comando!\n\n📄 *Detalhes:* ${err.message}` });
  }
};
