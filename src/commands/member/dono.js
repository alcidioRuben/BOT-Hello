module.exports = {
  commands: ["dono", "criador", "owner"],
  description: "Mostra o perfil e informações do dono do bot",
  type: "member",

  handle: async ({ socket, remoteJid, sendSuccessReply, sendErrorReply }) => {
    const dono = "258849311757@s.whatsapp.net"; // <- Substitua pelo seu número
    const nomeDono = "FRANK ỼỺ"; // <- Substitua pelo seu nome

    let profileUrl = "https://telegra.ph/file/36dc2a1c4f3eb01444c3b.jpg";

    try {
      const fetched = await socket.profilePictureUrl(dono, "image");
      if (fetched) profileUrl = fetched;
    } catch (err) {
      console.log("🤖 ⚠️ Erro ao buscar foto do dono:", err.message);
      // não dá erro grave, só continua com imagem padrão
    }

    const mensagem = `
🤖 ✅ INFORMAÇÕES DO MEU DONO:

👤 *Nome:* ${nomeDono}
📞 *Número:* wa.me/${dono.replace("@s.whatsapp.net", "")}
💼 *Função:* Desenvolvedor e Administrador
🌐 *WhatsApp:* https://wa.me/${dono.replace("@s.whatsapp.net", "")}
`;

    try {
      await socket.sendMessage(remoteJid, {
        image: { url: profileUrl },
        caption: mensagem.trim(),
      });

      // ✅ Responde com sucesso e reage
      await sendSuccessReply("Informações do meu dono enviadas com sucesso!");
    } catch (error) {
      console.error("Erro ao enviar perfil do meu dono:", error.message);

      // ❌ Responde com erro e reage
      await sendErrorReply("Erro ao enviar as informaçoes do meu dono");
    }
  },
};