const path = require('path');
const { readConcorrentes, addConcorrente } = require(path.join(__dirname, '../../../storage/anticoncorrencia.js'));

module.exports = {
  commands: ['anticoncorrencia'],
  description: 'Adiciona número na base ou checa concorrência no grupo',
  type: 'admin',

  /**
   * @param {{
   *   args: string[],
   *   sendSuccessReply: Function,
   *   sendErrorReply: Function,
   *   sendWarningReply: Function,
   *   remoteJid: string,
   *   isGroup: boolean,
   *   socket: any
   * }} props
   */
  handle: async ({ args, sendSuccessReply, sendErrorReply, sendWarningReply, remoteJid, isGroup, socket }) => {
    if (!isGroup) {
      await sendErrorReply('Este comando só funciona em grupos!');
      return;
    }

    if (args.length >= 1) {
      // Adiciona número
      const numero = args[0].replace(/[^0-9]/g, '');
      if (numero.length < 5) {
        await sendErrorReply('Número inválido. Use: !anticoncorrencia 2588...');
        return;
      }

      try {
        console.log(`[DEBUG] Resolvendo número: ${numero}`);
        const results = await socket.onWhatsApp(numero);
        console.log(`[DEBUG] onWhatsApp result:`, results);

        if (!results || results.length === 0 || !results[0]?.lid) {
          await sendErrorReply('Número não encontrado ou não tem LID no WhatsApp!');
          return;
        }

        const lid = results[0].lid;

        addConcorrente(lid);
        await sendSuccessReply(`Número *${lid}* adicionado à base de concorrentes!`);
      } catch (err) {
        console.error('Erro ao resolver LID:', err);
        await sendErrorReply(`Erro ao tentar resolver o número: ${err.message}`);
      }

      return;
    }

    // Verifica concorrentes no grupo
    try {
      const metadata = await socket.groupMetadata(remoteJid);
      const participantes = metadata.participants.map(p => p.id);

      console.log('📋 DEBUG PARTICIPANTES:', participantes);

      const lista = readConcorrentes();

      if (!Array.isArray(lista)) {
        console.error('❌ Lista de concorrentes não é um array:', lista);
        await sendErrorReply('Erro interno: lista de concorrentes inválida.');
        return;
      }

      const encontrados = participantes.filter(id => lista.includes(id));

      if (encontrados.length === 0) {
        await sendSuccessReply('Nenhum concorrente encontrado neste grupo!');
      } else {
        let linhas = [];

        for (const lid of encontrados) {
          const numero = lid.split('@')[0];
          let nome = 'sem nome';

          try {
            const infos = await socket.onWhatsApp(numero);
            if (infos && infos[0]?.notify) {
              nome = infos[0].notify;
            }
          } catch (err) {
            console.log(`❓ Não consegui resolver nome para ${lid}:`, err);
          }

          linhas.push(`• ${numero} (${nome})`);

          // Remover automaticamente o concorrente do grupo
          try {
            await socket.groupParticipantsUpdate(remoteJid, [lid], 'remove');
            console.log(`🚫 Concorrente removido automaticamente: ${lid}`);
          } catch (removalError) {
            console.error(`❌ Erro ao remover concorrente ${lid}:`, removalError);
            await sendErrorReply(`Falha ao remover concorrente ${numero} (${nome}). Verifique permissões.`);
          }
        }

        const txt = linhas.join('\n');
        await sendWarningReply(`Concorrentes encontrados e removidos automaticamente:\n${txt}`);
      }
    } catch (err) {
      console.error('Erro ao obter participantes:', err);
      await sendErrorReply(`Erro ao obter participantes!\n\n${err.message}`);
    }
  }
};