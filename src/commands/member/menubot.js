module.exports = {
  commands: ['menubot', 'ajuda'],
  description: 'Exibe o menu de comandos disponíveis',
  type: 'member',

  handle: async ({ sendReply, sendReact }) => {
    const mensagem = `
╭━━━━━━━━━━━━━━━━━━━╮  
🎉 *MENU PRINCIPAL – SENTRY-X BOT* 🎉  
╰━━━━━━━━━━━━━━━━━━━╯

📍 *A. COMANDOS PARA TODOS:*  
━━━━━━━━━━━━━━━━━━━━━  
👑 *.dono* – Ver quem criou o bot  
👤 *.perfil* – Ver tuas informações  
📶 *.ping* – Testar se o bot está online  

🔐 *B. ADMINISTRADORES:*  
━━━━━━━━━━━━━━━━━━━━━  
🔓 *.abri* – Abrir o grupo para mensagens  
🔗 *.anti-link 1/0* – Ativar ou desativar anti-links  
🌍 *.antiestrangeiros-on/off* – Bloquear nros internacionais  
⏱️  *.antispam <seg>* – Definir tempo entre comandos  
❌ *.anularcompra <qtd>* – Remover MB de alguém  
🚫 *.ban* – Banir membro (responda a msg)  
📅 *.bot* – Ver dias restantes do bot  
📋 *.clientes* – Ver clientes registrados  
📦 *.compra <qtd>* – Adicionar compra (responda a msg)  
💰 *.compras on/off* – Ativa/desativa sistema de vendas  
🗑️  *.delete* – Apagar mensagem respondida  
🚪 *.exit 1/0* – Ativar/desativar msg de saída  
🔒 *.fechar* – Fechar o grupo  
📢 *.hidetag* – Marcar todos com uma msg  
🧹 *.limpar* – Limpar o chat  
🧼 *.limparcompras* – Resetar histórico de vendas  
📄 *.listanano* – Listar respostas automáticas  
✏️  *.nanocomandos on/off* – Ativar/desativar nano comandos  
🧠 *.nanoadd* – Adicionar resposta automática
❌ *.nanodel* – Remover comando automático  
📊 *.p* – Ver ranking de vendas (responda a msg)  
📈 *.picos* – Ver horários com mais vendas  
👁️  *.relevar* – Mostrar mídia de visualização única  
🎈 *.welcome 1/0* – Ativar/desativar boas-vindas  

💬 *D. EXTRAS (Exemplos):*  
━━━━━━━━━━━━━━━━━━━━━  
*.compra 500MB* (respondendo msg)  
*.anularcompra 100MB*  
*.nanoadd oi, tudo bem*  
*.nanodel oi*  
*.anti-link 1* / *.anti-link 0*  
*.welcome 1* / *.welcome 0*

╭━━━━━━━━━━━━━━━━━━╮
┃ ⚙️ BOT MULTIFUNÇÕES WHATSAPP
╰━━━━━━━━━━━━━━━━━━╯
    `;

    await sendReact('✅'); // Reage com ✅
    await sendReply(mensagem);
  }
};
