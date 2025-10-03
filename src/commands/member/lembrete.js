const { PREFIX } = require(`${BASE_DIR}/config`);

module.exports = {
  name: "lembrete",
  description: "Define um lembrete que será enviado após um tempo.",
  commands: ["lembrete", "rec"],
  usage: `${PREFIX}lembrete <tempo> <mensagem>`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
    handle: async ({ args, sendText }) => {
    if (!args || args.length < 2) {
      return await sendText(
        "❌ Uso incorreto. Exemplo:\n.lembrete 10min Verificar comprovativo"
      );
    }

    const tempoRaw = args[0];
    const mensagem = args.slice(1).join(" ");

    const tempoMatch = tempoRaw.match(/^(\d+)(min|seg)/i);
    if (!tempoMatch) 
      return await sendText(
        "❌ Formato de tempo inválido. Use '10min' ou '30seg'."
      );
    

    const tempo = parseInt(tempoMatch[1]);
    const tipo = tempoMatch[2].toLowerCase();
    const ms = tipo === "min" ? tempo * 60000 : tempo * 1000;

    await sendText(`⏳ Lembrete agendado para{tempo} ${tipo}...`);

    setTimeout(() => {
sendText(`⏰ *Lembrete:* {mensagem}`);
    }, ms);
  },
};