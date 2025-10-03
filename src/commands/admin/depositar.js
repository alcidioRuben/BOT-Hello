const { PREFIX } = require(`${BASE_DIR}/config`);

module.exports = {
  name: "depositar",
  description: "Deposita saldo na conta de um usuário",
  commands: ["depositar", "addsaldo"],
  usage: `${PREFIX}depositar`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */

  handle: async ({ body, mentions, sendText }) => {

    const match = body.match(/(\d+)/);
    const valor = match ? parseInt(match[1]) : null;
    const alvo = Object.keys(mentions)[0];

    if (!valor || !alvo) {
      return await sendText("❌ Uso incorreto. Exemplo:\n.depositar @usuario 50");
    }

    const data = JSON.parse(fs.readFileSync(path));
    data[alvo] = (data[alvo] || 0) + valor;
    fs.writeFileSync(path, JSON.stringify(data, null, 2));

    await sendText(`✅ Saldo de *${valor} MTS* depositado para o usuário.`);
  },
};
