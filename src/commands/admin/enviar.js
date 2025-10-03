const { registrarCompra, getRanking, getDadosUser, getComprasHoje } = require('../../../storage/compras');
const fs = require("fs");
const systemsFile = "./storage/systems.json";

function isComprasActive(groupId) {
  if (!fs.existsSync(systemsFile)) return false;
  const data = JSON.parse(fs.readFileSync(systemsFile));
  return data[groupId]?.compras === true;
}

module.exports = {
  commands: ['enviar'],
  description: 'Registra uma compra de pacote',
  type: 'owner',

  handle: async ({ remoteJid, sendSuccessReply, sendErrorReply, args, webMessage, pushName }) => {

    if (!isComprasActive(remoteJid)) {
      return await sendErrorReply(
        `❌ O sistema de compras está DESATIVADO neste grupo.\n` +
        `Para ativar, envie o comando:\n` +
        `.compras on\n` +
        `*Apenas administradores podem ativar.*`
      );
    }

    if (!args || args.length < 1) {
      return await sendErrorReply('USE O FORMATO: RESPONDA À MENSAGEM DO COMPRADOR COM .COMPRA 500MB');
    }

    // Pega o número da pessoa respondida (participant)
    const quotedParticipant = webMessage?.message?.extendedTextMessage?.contextInfo?.participant;

    if (!quotedParticipant) {
      return await sendErrorReply('VOCÊ PRECISA RESPONDER À MENSAGEM DO COMPRADOR COM O COMANDO!');
    }

    const numeroComprador = quotedParticipant;
    const numeroLimpo = numeroComprador.split('@')[0];

    // Pega o valor comprado (exemplo: 500MB)
    const quantidadeRaw = args.join(' ').trim();
    const quantidade = parseFloat(quantidadeRaw.toUpperCase().replace('MB','').replace('GB','')) || 0;

    if (quantidade <= 0) {
      return await sendErrorReply('QUANTIDADE INVÁLIDA. EXEMPLO CORRETO: .COMPRA 500MB');
    }

    // Registra a compra no JSON
    registrarCompra(remoteJid, numeroComprador, pushName, quantidade);

    const dadosUser = getDadosUser(remoteJid, numeroComprador);
    const hojeCompras = getComprasHoje(remoteJid, numeroComprador);
    const ranking = getRanking(remoteJid);
    const posicao = ranking.findIndex(u => u.userId === numeroComprador) + 1;
    const maiorComprador = ranking[0];

    // Calcular total do maior comprador em MB ou GB
    let maiorCompradorTotalStr = 'N/A';
    let mentions = [numeroComprador];

    if (maiorComprador) {
      let totalMaior = maiorComprador.total;
      if (totalMaior >= 1000) {
        const gb = (totalMaior / 1000).toFixed(1);
        maiorCompradorTotalStr = `${gb}GB`;
      } else {
        maiorCompradorTotalStr = `${totalMaior}MB`;
      }
      mentions.push(maiorComprador.userId);
    }

    const totalCompradoUser = dadosUser.total >= 1000
      ? `${(dadosUser.total / 1000).toFixed(1)}GB`
      : `${dadosUser.total}MB`;

const agora = new Date();
const formatter = new Intl.DateTimeFormat('pt-MZ', {
  timeZone: 'Africa/Maputo',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false
});
const dataHora = formatter.format(agora);

const mensagem = 
`\*Envio nº ${hojeCompras} confirmado:*
\n👤 *Cliente:* @${numeroLimpo}\n💾 *Quantidade:* ${quantidade}MB\n⏰ *data e hora:* ${dataHora}\n________________________________________________`;

    await sendSuccessReply(mensagem, mentions);
  }
};