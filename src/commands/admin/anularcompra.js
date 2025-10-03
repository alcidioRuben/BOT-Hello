const { registrarCompra, getRanking, getDadosUser, getComprasHoje } = require('../../../storage/compras');

module.exports = {
  commands: ['anularcompra'],
  type: 'admin',   // ✅ Somente administradores podem usar
  description: 'Anula uma quantidade comprada de MB para um usuário',
  
  handle: async ({ args, remoteJid, sendSuccessReply, sendErrorReply, webMessage, pushName }) => {
    if (!args || args.length < 1) {
      return await sendErrorReply('USE O FORMATO: RESPONDA À MENSAGEM DO COMPRADOR COM !ANULARCOMPRA 1000MB');
    }

    const quotedParticipant = webMessage?.message?.extendedTextMessage?.contextInfo?.participant;
    if (!quotedParticipant) {
      return await sendErrorReply('VOCÊ PRECISA RESPONDER À MENSAGEM DO COMPRADOR COM O COMANDO!');
    }

    const numeroComprador = quotedParticipant;
    const numeroLimpo = numeroComprador.split('@')[0];

    // Pega a quantidade a anular
    const quantidadeRaw = args.join(' ').trim();
    const quantidade = parseFloat(quantidadeRaw.toUpperCase().replace('MB','').replace('GB','')) || 0;

    if (quantidade <= 0) {
      return await sendErrorReply('QUANTIDADE INVÁLIDA. EXEMPLO CORRETO: !ANULARCOMPRA 1000MB');
    }

    // Subtrai como se fosse uma "compra negativa"
    registrarCompra(remoteJid, numeroComprador, pushName, -quantidade);

    const dadosUser = getDadosUser(remoteJid, numeroComprador);
    const hojeCompras = getComprasHoje(remoteJid, numeroComprador);
    const ranking = getRanking(remoteJid);
    const posicao = ranking.findIndex(u => u.userId === numeroComprador) + 1;

    // Formata o total em MB ou GB
    const totalComprado = dadosUser.total >= 1000
      ? `${(dadosUser.total / 1000).toFixed(1)}GB`
      : `${dadosUser.total}MB`;

    const mensagem = 
`COMPRA ANULADA PARA @${numeroLimpo}

📉 VALOR REMOVIDO: ${quantidadeRaw.toUpperCase()}
📦 TOTAL ATUAL: ${totalComprado}
🛍️ COMPRAS DE HOJE: ${hojeCompras}
🏆 POSIÇÃO NO RANKING: ${posicao > 0 ? posicao : 'Fora do ranking'}
`;

    await sendSuccessReply(mensagem, [numeroComprador]);
  }
};
