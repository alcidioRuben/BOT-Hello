const { getRanking, getDadosUser, getComprasHoje } = require('../../../storage/compras');

module.exports = {
  commands: ['p'],
  type: 'admin',
  description: 'Mostra a posição do comprador no ranking',

  handle: async ({ remoteJid, userJid, webMessage, sendSuccessReply, sendErrorReply }) => {
    const quotedParticipant = webMessage?.message?.extendedTextMessage?.contextInfo?.participant;
    const targetJid = quotedParticipant || userJid;

    if (!targetJid) {
      return await sendErrorReply('NÃO FOI POSSÍVEL IDENTIFICAR O USUÁRIO.');
    }

    const numeroLimpo = targetJid.split('@')[0];
    const dadosUser = getDadosUser(remoteJid, targetJid);

    if (!dadosUser) {
      return await sendSuccessReply(`O USUÁRIO @${numeroLimpo} NÃO TEM NENHUMA COMPRA REGISTRADA NO GRUPO.`, [targetJid]);
    }

    const ranking = getRanking(remoteJid) || [];
    const hojeCompras = getComprasHoje(remoteJid, targetJid) || 0;
    const posicao = ranking.findIndex(u => u.userId === targetJid) + 1;

    const totalComprado = dadosUser.total >= 1000
      ? `${(dadosUser.total / 1000).toFixed(1)}GB`
      : `${dadosUser.total}MB`;

    const mensagem = 
`📊 POSIÇÃO DE @${numeroLimpo}

🏆 RANKING: ${posicao > 0 ? `#${posicao}` : 'Fora do ranking'}
📦 TOTAL ACUMULADO: ${totalComprado}
🛍️ COMPRAS DE HOJE: ${hojeCompras}`;

    await sendSuccessReply(mensagem, [targetJid]);
  }
};