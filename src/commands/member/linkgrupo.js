module.exports = {
  commands: ['linkgrupo', 'link'],
  description: 'Envia o link do grupo atual',
  type: 'member',
  handle: async ({ socket, remoteJid, sendReply }) => {
    if (!remoteJid.endsWith('@g.us')) {
      return sendReply('❌ Este comando só funciona dentro de grupos!');
    }

    try {
      const groupMetadata = await socket.groupMetadata(remoteJid);
      const inviteCode = groupMetadata.inviteCode;

      if (!inviteCode) {
        return sendReply('❌ O link do grupo não está disponível. Verifique se o bot é administrador e se o link está ativado.');
      }

      const link = `https://chat.whatsapp.com/${inviteCode}`;
      await sendReply(`🔗 Aqui está o link do grupo:\n${link}`);
    } catch (error) {
      console.error(error);
      await sendReply('❌ Erro ao tentar pegar o link do grupo.');
    }
  }
};
