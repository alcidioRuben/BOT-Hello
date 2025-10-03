const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../../../storage/antispam.json');

function loadAntispamData() {
  if (!fs.existsSync(filePath)) return {};
  return JSON.parse(fs.readFileSync(filePath));
}

function saveAntispamData(data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

module.exports = {
  commands: ['antispam'],
  description: 'Ativa/desativa delay nas respostas do grupo',
  type: "member",

  handle: async ({ remoteJid, args, sendSuccessReply, sendErrorReply }) => {
    if (!remoteJid.endsWith('@g.us')) {
      return sendErrorReply('ESSE COMANDO SÓ FUNCIONA EM GRUPO!');
    }

    let data = loadAntispamData();

    if (!args.length) {
      data[remoteJid] = 5;
      saveAntispamData(data);
      return sendSuccessReply('ANTISPAM ATIVADO COM 5 SEGUNDOS!');
    }

    if (args[0].toLowerCase() === 'off') {
      delete data[remoteJid];
      saveAntispamData(data);
      return sendSuccessReply('ANTISPAM DESATIVADO!');
    }

    const tempo = parseInt(args[0]);
    if (isNaN(tempo) || tempo < 1 || tempo > 60) {
      return sendErrorReply('USE UM NÚMERO ENTRE 1 E 60 SEGUNDOS!');
    }

    data[remoteJid] = tempo;
    saveAntispamData(data);
    return sendSuccessReply(`ANTISPAM ATIVADO COM ${tempo} SEGUNDOS!`);
  }
};