const { PREFIX } = require(`${BASE_DIR}/config`);

module.exports = {
  name: "calcular",
  description: "Resolve expressões matemáticas simples",
  commands: ["calcula"],
  aliases: ["calc", "conta"],
  usage: `${PREFIX}calcular <expressão>`,
  type: "member",

  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ args, sendReply, sendReact }) => {
    if (!args || args.length === 0) {
      await sendReact("❌");
      return sendReply("❌ USE: .calcular 1+1");
    }

    try {
      let expressao = args.join("")
        .replace(/×/g, "*")
        .replace(/÷/g, "/")
        .replace(/ /g, "");

      if (!/^[0-9+\-*/().]+$/.test(expressao)) {
        await sendReact("❌");
        return sendReply("❌ EXPRESSÃO INVÁLIDA! USE APENAS NÚMEROS E OPERADORES.");
      }

      const resultado = eval(expressao);
      await sendReact("✅");
      return sendReply(`✅ ${args.join(" ")} = *${resultado}*`);
    } catch (err) {
      await sendReact("❌");
      return sendReply("❌ ERRO AO CALCULAR! VERIFIQUE A EXPRESSÃO.");
    }
  },
};