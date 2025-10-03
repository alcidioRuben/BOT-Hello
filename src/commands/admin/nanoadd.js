const fs = require('fs');
const path = './storage/nanocomandos.json';
const { addNanoCommand } = require('../../../storage/nano');

function isNanoActive(groupId) {
  if (!fs.existsSync(path)) return false;
  const data = JSON.parse(fs.readFileSync(path));
  return data[groupId]?.enabled === true;
}

module.exports = {
  commands: ['nanoadd'],
  type: 'admin',
  handle: async ({ args, remoteJid, sendSuccessReply, sendErrorReply, sendReact }) => {

    if (!isNanoActive(remoteJid)) {
      await sendReact('☠️');
      return sendErrorReply('🤖 ❌ *O SISTEMA DE NANOCOMANDOS ESTÁ DESATIVADO!*');
    }

    if (args.length === 0) {
      return sendErrorReply("USE: !nanoadd <gatilho>, <resposta>");
    }

    const texto = args.join(" ").trim();
    const primeiraVirgula = texto.indexOf(",");

    if (primeiraVirgula === -1) {
      return sendErrorReply(
        "FORMATO INVÁLIDO!\nUSE: !nanoadd <gatilho>, <resposta>\nEXEMPLO: !nanoadd oi, tudo bem?"
      );
    }

    const chave = texto.slice(0, primeiraVirgula).trim();
    const resposta = texto.slice(primeiraVirgula + 1).trim();

    if (!chave || !resposta) {
      return sendErrorReply(
        "FALTOU O GATILHO OU A RESPOSTA!\nEXEMPLO: !nanoadd oi, tudo bem?"
      );
    }

    addNanoCommand(remoteJid, chave, resposta);

    return sendSuccessReply(
      `COMANDO ADICIONADO NESTE GRUPO!\n\n🔹 GATILHO: ${chave}\n🔹 RESPOSTA: ${resposta}`
    );
  }
};