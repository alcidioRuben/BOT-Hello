const fs = require('fs');
const path = './storage/nanocomandos.json';
const { deleteNanoCommand } = require('../../../storage/nano');

function isNanoActive(groupId) {
  if (!fs.existsSync(path)) return false;
  const data = JSON.parse(fs.readFileSync(path));
  return data[groupId]?.enabled === true;
}

module.exports = {
  commands: ['nanodel'],
  type: 'admin',
  handle: async ({ args, remoteJid, sendSuccessReply, sendErrorReply, sendReact }) => {

    if (!isNanoActive(remoteJid)) {
      await sendReact('☠️');
      return sendErrorReply('🤖 ❌ *O SISTEMA DE NANOCOMANDOS ESTÁ DESATIVADO!*');
    }

    if (args.length === 0) {
      return sendErrorReply("USE: !nanodel <gatilho>");
    }

    const chave = args.join(" ").trim();

    if (!chave) {
      return sendErrorReply("ESPECIFIQUE O GATILHO QUE QUER REMOVER!");
    }

    const result = deleteNanoCommand(remoteJid, chave);

    if (result) {
      return sendSuccessReply(`COMANDO REMOVIDO DO GRUPO!\n\n🔹 GATILHO: ${chave}`);
    } else {
      return sendErrorReply(`NÃO ENCONTREI O COMANDO "${chave}" PARA REMOVER.`);
    }
  }
};