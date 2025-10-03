const fs = require('fs');
const path = './storage/nanocomandos.json';

module.exports = {
  commands: ['nanocomandos'],
  description: 'Ativa ou desativa os comandos .nanoadd e .nanodel',
  type: 'admin',
  handle: async ({ args, remoteJid, sendReply, sendReact }) => {
    // Removida a verificação de admin, conforme pedido

    if (!args[0] || !['on', 'off'].includes(args[0].toLowerCase())) {
      await sendReact('☠️');
      return sendReply('❌ *USE: .nanocomandos on OU .nanocomandos off*');
    }

    let data = {};
    if (fs.existsSync(path)) {
      data = JSON.parse(fs.readFileSync(path));
    }

    const modo = args[0].toLowerCase();
    if (!data[remoteJid]) data[remoteJid] = {};

    data[remoteJid].enabled = modo === 'on';

    fs.writeFileSync(path, JSON.stringify(data, null, 2));

    await sendReact('💸');

    if (modo === 'on') {
      return sendReply('✅ *SISTEMA DE NANOCOMANDOS ATIVADO!* Agora os comandos .nanoadd e .nanodel funcionarão.');
    } else {
      return sendReply('✅ *SISTEMA DE NANOCOMANDOS DESATIVADO!* Os comandos .nanoadd e .nanodel estão desabilitados.');
    }
  }
};