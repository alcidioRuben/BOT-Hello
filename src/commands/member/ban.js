module.exports = {
  commands: ['ban'],
  description: 'Remove alguém do grupo usando senha (qualquer membro pode usar)',
  category: 'member',

  handle: async ({ sock, remoteJid, sendReply, args, quoted, isGroup }) => {
    const SENHA_CORRETA = '.'; // 🔑 MUDE AQUI SUA SENHA

    if (!isGroup) {
      return await sendReply('ESTE COMANDO SÓ FUNCIONA EM GRUPO.');
    }

    if (!args || args.length < 1) {
      return await sendReply('USE: !ban <senha> [número ou responda a mensagem]');
    }

    const senhaInformada = args[0];
    if (senhaInformada !== SENHA_CORRETA) {
      return await sendReply('SENHA INCORRETA!');
    }

    let alvo;

    if (quoted && quoted.sender) {
      alvo = quoted.sender;
    } else if (args[1]) {
      const numero = args[1].replace(/[^0-9]/g, '');
      alvo = `${numero}@s.whatsapp.net`;
    } else {
      return await sendReply('VOCÊ PRECISA MENCIONAR OU RESPONDER ALGUÉM PARA BANIR.');
    }

    try {
      await sock.groupParticipantsUpdate(remoteJid, [alvo], 'remove');
      await sendReply(`O USUÁRIO @${alvo.split('@')[0]} FOI REMOVIDO COM SUCESSO!`, [alvo]);
    } catch (e) {
      console.error('Erro ao banir:', e);
      await sendReply('ERRO AO TENTAR REMOVER O MEMBRO. TENHO PERMISSÃO DE ADMIN?');
    }
  },
};
