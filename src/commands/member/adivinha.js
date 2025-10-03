const { PREFIX } = require(`${BASE_DIR}/config`);

module.exports = {
  name: "adivinha",
  description: "Jogo de adivinhar número de 1 a 10",
  commands: ["adivinha"],
  usage: `${PREFIX}adivinha <número>`,
  
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ args, sendReply, sendReact, fullMessage }) => {
    const numeroEscolhido = Math.floor(Math.random() * 10) + 1;

    if (!args[0]) {
      await sendReact("😭");
      return sendReply("❌ DIGITE UM NÚMERO DE 1 A 10. EXEMPLO: .adivinha 5");
    }

    const palpite = parseInt(args[0]);
    if (isNaN(palpite) || palpite < 1 || palpite > 10) {
      await sendReact("😭");
      return sendReply("❌ NÚMERO INVÁLIDO! DIGITE UM NÚMERO ENTRE 1 E 10.");
    }

    if (palpite === numeroEscolhido) {
      await sendReact("✅️");
      return sendReply(`✅ PARABÉNS! VOCÊ ACERTOU 🎉 O NÚMERO ERA ${numeroEscolhido}.`);
    } else {
      await sendReact("😭");
      return sendReply(`❌ VOCÊ ERROU! O NÚMERO ERA ${numeroEscolhido}. TENTE NOVAMENTE!`);
    }
  },
};