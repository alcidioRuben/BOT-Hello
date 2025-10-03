module.exports = {
  commands: ['caraoucoroa', 'cara', 'coroa'],
  description: 'Jogo simples de Cara ou Coroa',
  type: 'member',

  /**
   * @param {{
   *   args: string[],
   *   sendSuccessReply: Function,
   *   sendErrorReply: Function,
   *   sendReply: Function
   * }} props
   */
  handle: async ({ args, sendReply, sendSuccessReply, sendErrorReply }) => {
    if (!args.length) {
      await sendSuccessReply(
        'Para jogar, escolha: *cara* ou *coroa*\n\nExemplo:\n!caraoucoroa cara\n!caraoucoroa coroa'
      );
      return;
    }

    const escolhaUser = args[0].toLowerCase();

    if (escolhaUser !== 'cara' && escolhaUser !== 'coroa') {
      await sendErrorReply('Escolha inválida! Use: cara ou coroa.');
      return;
    }

    const resultado = Math.random() < 0.5 ? 'cara' : 'coroa';
    const emoji = resultado === 'cara' ? '🪙' : '🏵️';

    if (escolhaUser === resultado) {
      await sendSuccessReply(
        `Deu *${resultado.toUpperCase()}* ${emoji}\n\n🎉 Você ganhou!`
      );
    } else {
      await sendReply(
        `Deu *${resultado.toUpperCase()}* ${emoji}\n\n😢 Você perdeu!`
      );
    }
  }
};