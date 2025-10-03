// Armazena partidas por grupo ou chat
const partidas = new Map();

function renderCell(val, idx) {
  if (val === 'X') return '❌';
  if (val === 'O') return '⭕️';
  return `⬜️${idx + 1}️⃣`;
}

function formatRow(tab, start) {
  return `${renderCell(tab[start], start)} | ${renderCell(tab[start + 1], start + 1)} | ${renderCell(tab[start + 2], start + 2)}`;
}

function mostrarTabuleiro(tab) {
  return `
🎮 *JOGO DA VELHA* 🤖

${formatRow(tab, 0)}
━━━+━━━+━━━
${formatRow(tab, 3)}
━━━+━━━+━━━
${formatRow(tab, 6)}
`.trim();
}

function verificarVitoria(tab, jogador) {
  const vitorias = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  return vitorias.some(comb => comb.every(i => tab[i] === jogador));
}

function estaCheio(tab) {
  return tab.every(cell => cell === 'X' || cell === 'O');
}

module.exports = {
  commands: ['velha'],
  description: 'Jogue Jogo da Velha contra o bot ou com um amigo!',
  type: 'member',

  /**
   * @param {{
   *   args: string[],
   *   sendReply: Function,
   *   remoteJid: string,
   *   userJid: string,
   *   mentionedJids: string[],
   *   pushNames: Object,
   *   sendSuccessReply: Function,
   *   sendErrorReply: Function
   * }} props
   */
  handle: async ({
    args,
    sendReply,
    remoteJid,
    userJid,
    mentionedJids,
    pushNames,
    sendSuccessReply,
    sendErrorReply
  }) => {

    // 1️⃣ Partida entre dois usuários (menção)
    if (mentionedJids && mentionedJids.length > 0) {
      const oponente = mentionedJids[0];

      if (oponente === userJid) {
        await sendErrorReply('🤖 ❌ Você não pode jogar contra você mesmo!');
        return;
      }

      const partidaExistente = partidas.get(remoteJid);
      if (partidaExistente && partidaExistente.jogadores && partidaExistente.jogadores.includes(userJid) && partidaExistente.jogadores.includes(oponente)) {
        await sendErrorReply('🤖 ❌ Já existe uma partida em andamento entre vocês neste grupo!');
        return;
      }

      partidas.set(remoteJid, {
        tabuleiro: Array(9).fill(null),
        jogadores: [userJid, oponente],
        turno: 0
      });

      await sendSuccessReply(`
🎮 *JOGO DA VELHA ENTRE DOIS JOGADORES* 🤖

✅ Quem joga ❌: @${userJid.split('@')[0]}
✅ Quem joga ⭕️: @${oponente.split('@')[0]}

Comece jogando! Use:
.velha <posição de 1 a 9>

${mostrarTabuleiro(Array(9).fill(null))}
`.trim(), [userJid, oponente]);

      return;
    }

    // 2️⃣ Se digitou só !velha sem nada → inicia partida contra bot
    if (args.length === 0) {
      partidas.set(remoteJid, {
        tabuleiro: Array(9).fill(null),
        jogadores: [userJid, null],
        turno: 0
      });

      await sendSuccessReply(`
🎮 *JOGO DA VELHA INICIADO* 🤖

✅ Você é ❌
✅ O bot é ⭕️

Para jogar, mande:
.velha <posição de 1 a 9>

${mostrarTabuleiro(Array(9).fill(null))}
`.trim());
      return;
    }

    // 3️⃣ Verifica se há partida em andamento
    const partida = partidas.get(remoteJid);

    if (!partida) {
      await sendErrorReply('🤖 ❌ Nenhuma partida ativa! Digite *!velha* para começar.');
      return;
    }

    const { tabuleiro, jogadores, turno } = partida;

    if (args.length !== 1) {
      await sendErrorReply('🤖 ❌ Use: !velha <posição de 1 a 9>');
      return;
    }

    const pos = parseInt(args[0], 10) - 1;
    if (isNaN(pos) || pos < 0 || pos > 8) {
      await sendErrorReply('🤖 ❌ Posição inválida! Use um número de 1 a 9.');
      return;
    }

    if (tabuleiro[pos]) {
      await sendErrorReply('🤖 ❌ Essa casa já está ocupada!');
      return;
    }

    // 4️⃣ Verifica se é a vez certa (para dois jogadores)
    if (jogadores[1]) {
      if (userJid !== jogadores[turno]) {
        const atualJid = jogadores[turno];
        const atualNome = pushNames?.[atualJid] || atualJid.split('@')[0];
        await sendErrorReply(`🤖 ❌ Não é sua vez! Aguarde a jogada de *${atualNome}*`);
        return;
      }
    }

    // 5️⃣ Marca jogada do jogador
    const simbolo = turno === 0 ? 'X' : 'O';
    tabuleiro[pos] = simbolo;

    // 6️⃣ Verifica vitória
    if (verificarVitoria(tabuleiro, simbolo)) {
      partidas.delete(remoteJid);

      if (jogadores[1]) {
        const vencedorNome = pushNames?.[userJid] || userJid.split('@')[0];
        await sendSuccessReply(`
🎉🏆 *PARABÉNS!* 🏆🎉

*${vencedorNome}* venceu!

${mostrarTabuleiro(tabuleiro)}
`.trim(), jogadores);
      } else {
        await sendSuccessReply(`
🎉🏆 *VOCÊ VENCEU!* 🏆🎉

${mostrarTabuleiro(tabuleiro)}
`.trim());
      }

      return;
    }

    // 7️⃣ Verifica empate
    if (estaCheio(tabuleiro)) {
      partidas.delete(remoteJid);
      await sendSuccessReply(`
🤝 *EMPATE!* 🤝

${mostrarTabuleiro(tabuleiro)}
`.trim());
      return;
    }

    // 8️⃣ Contra bot → bot joga automaticamente
    if (!jogadores[1]) {
      let disp = tabuleiro.map((v, i) => v ? null : i).filter(v => v !== null);
      const escolhaBot = disp[Math.floor(Math.random() * disp.length)];
      tabuleiro[escolhaBot] = 'O';

      if (verificarVitoria(tabuleiro, 'O')) {
        partidas.delete(remoteJid);
        await sendSuccessReply(`
😈 *EU VENCI!* 😈

${mostrarTabuleiro(tabuleiro)}
`.trim());
        return;
      }

      if (estaCheio(tabuleiro)) {
        partidas.delete(remoteJid);
        await sendSuccessReply(`
🤝 *EMPATE!* 🤝

${mostrarTabuleiro(tabuleiro)}
`.trim());
        return;
      }

      await sendSuccessReply(`
Sua jogada registrada!

${mostrarTabuleiro(tabuleiro)}

✅ Sua vez! Use: .velha <posição de 1 a 9>
`.trim());
      return;
    }

    // 9️⃣ Entre dois humanos → alterna turno
    partida.turno = turno === 0 ? 1 : 0;
    partidas.set(remoteJid, partida);

    const proximoJid = jogadores[partida.turno];
    const proximoNome = pushNames?.[proximoJid] || proximoJid.split('@')[0];

    await sendSuccessReply(`
Jogada registrada!

${mostrarTabuleiro(tabuleiro)}

✅ Vez de *${proximoNome}* jogar! Use: .velha<posição de 1 a 9>
`.trim(), jogadores);
  }
};