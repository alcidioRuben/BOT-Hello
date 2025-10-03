module.exports = {
  commands: ['ppt', 'pedrapapeltesoura'],
  description: 'Jogue Pedra, Papel ou Tesoura comigo!',
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
      await sendSuccessReply('Use: !ppt <pedra|papel|tesoura>');
      return;
    }

    const escolhaUser = args[0].toLowerCase();
    const opcoes = ['pedra', 'papel', 'tesoura'];

    if (!opcoes.includes(escolhaUser)) {
      await sendErrorReply('Escolha inválida. Use: pedra, papel ou tesoura!');
      return;
    }

    const escolhaBot = opcoes[Math.floor(Math.random() * 3)];

    let resultado = '';
    if (escolhaUser === escolhaBot) {
      resultado = '😐 Empate!';
    } else if (
      (escolhaUser === 'pedra' && escolhaBot === 'tesoura') ||
      (escolhaUser === 'papel' && escolhaBot === 'pedra') ||
      (escolhaUser === 'tesoura' && escolhaBot === 'papel')
    ) {
      resultado = '🎉 Você ganhou!';
    } else {
      resultado = '💀 Eu ganhei!';
    }

    await sendReply(
      `Você escolheu: *${escolhaUser}*\n🤖 ✅ Eu escolhi: *${escolhaBot}*\n\n${resultado}`
    );
  }
};