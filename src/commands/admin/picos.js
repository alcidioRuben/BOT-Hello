  const fs = require('fs');
const dayjs = require('dayjs');
const path = require('path');
const baileys = require('@whiskeysockets/baileys');

module.exports = {
  commands: ["picos", "picospv"],
  type: "admin",
  description: "Mostra estatísticas de compras do grupo ou no PV",

  handle: async ({ socket, command, remoteJid, sender, sendSuccessReply, sendWarningReply, sendErrorReply }) => {
    try {
      console.log('📁 Verificando arquivo compras.json...');
      const comprasPath = path.resolve(__dirname, '../../../storage/compras.json');
      if (!fs.existsSync(comprasPath)) {
        await sendErrorReply('ARQUIVO compras.json NÃO ENCONTRADO!');
        return;
      }

      console.log('📖 Lendo arquivo de compras...');
      const raw = fs.readFileSync(comprasPath, 'utf-8');
      const dadosBrutos = JSON.parse(raw);

      console.log('📊 Processando dados do grupo...');
      const grupoDados = dadosBrutos[remoteJid];
      if (!grupoDados) {
        await sendWarningReply('ESTE GRUPO NÃO TEM REGISTROS DE COMPRAS!');
        return;
      }

      const dados = [];
      for (const clienteId in grupoDados) {
        const historico = grupoDados[clienteId].historico || [];
        for (const compra of historico) {
          dados.push({
            numero: clienteId,
            quantidade_gb: compra.quantidade / 1024,
            data_hora: compra.data
          });
        }
      }

      if (!dados.length) {
        await sendWarningReply('NENHUM DADO DE COMPRAS ENCONTRADO PARA ESTE GRUPO!');
        return;
      }

      const hoje = dayjs().format('YYYY-MM-DD');
      const hojeCompras = dados.filter(item => dayjs(item.data_hora).format('YYYY-MM-DD') === hoje);
      console.log(`📆 Compras de hoje (${hoje}): ${hojeCompras.length}`);

      const diasDaSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
      const contagemPorDia = {};
      dados.forEach(item => {
        const dia = diasDaSemana[dayjs(item.data_hora).day()];
        contagemPorDia[dia] = (contagemPorDia[dia] || 0) + 1;
      });
      const diasOrdenados = Object.entries(contagemPorDia).sort((a, b) => b[1] - a[1]);
      console.log('📅 Contando compras por dia da semana...');

      const top3Dias = diasOrdenados.slice(0, 3).map(([dia, qtd]) => `• ${dia}: ${qtd} compras`).join('\n');
      const diaMenos = diasOrdenados[diasOrdenados.length - 1];
      const menosDia = `• ${diaMenos[0]}: ${diaMenos[1]} compras`;

      const contagemHora = {};
      for (let h = 6; h <= 23; h++) contagemHora[h] = 0;
      dados.forEach(item => {
        const hora = dayjs(item.data_hora).hour();
        if (hora >= 6 && hora <= 23) contagemHora[hora]++;
      });
      const horasOrdenadas = Object.entries(contagemHora).sort((a, b) => b[1] - a[1]);
      console.log('⏰ Contando compras por hora...');

      const top3Horas = horasOrdenadas.slice(0, 3).map(([h, qtd]) => `• ${h}h: ${qtd} compras`).join('\n');
      const horasMortas = horasOrdenadas.reverse().slice(0, 3).map(([h, qtd]) => `• ${h}h: ${qtd} compras`).join('\n');

      const totalHoje = hojeCompras.reduce((sum, item) => sum + item.quantidade_gb, 0).toFixed(2);
      console.log(`📦 Total vendido hoje (GB): ${totalHoje}`);

      const clientesAtivosHoje = [...new Set(hojeCompras.map(item => item.numero))].length;
      console.log(`👥 Clientes únicos hoje: ${clientesAtivosHoje}`);

      const compradoresHoje = {};
      hojeCompras.forEach(item => {
        compradoresHoje[item.numero] = (compradoresHoje[item.numero] || 0) + item.quantidade_gb;
      });

      const maisComprou = Object.entries(compradoresHoje).sort((a, b) => b[1] - a[1])[0];

      let quemMaisComprou = 'Nenhum';
      if (maisComprou) {
        let numeroReal = maisComprou[0].split('@')[0];

        try {
          if (maisComprou[0].includes('@lid') && baileys?.jidDecode) {
            const decoded = baileys.jidDecode(maisComprou[0]);
            if (decoded?.user) {
              numeroReal = decoded.user;
            }
          } else {
            numeroReal = maisComprou[0].split('@')[0];
          }

          const clientesPath = path.resolve(__dirname, '../../../storage/clientes.json');
          if (fs.existsSync(clientesPath)) {
            console.log('🔎 Buscando número real de quem mais comprou...');
            const rawClientes = fs.readFileSync(clientesPath, 'utf-8');
            console.log('📖 Lendo arquivo de clientes...');
            const clientesData = JSON.parse(rawClientes);

            if (clientesData[maisComprou[0]]?.numero) {
              numeroReal = clientesData[maisComprou[0]].numero;
            } else if (clientesData[`${numeroReal}@lid`]?.numero) {
              numeroReal = clientesData[`${numeroReal}@lid`].numero;
            }
          }
        } catch (err) {
          console.error('Erro ao decodificar ou ler clientes.json:', err);
        }

        quemMaisComprou = `@${numeroReal} - ${maisComprou[1].toFixed(2)} GB`;
      }

      const resposta = `📅 *DATA E HORA:* ${dayjs().format('DD-MM-YYYY HH:mm:ss')}

📈 *TOP 3 DIAS COM MAIS COMPRAS:*
${top3Dias}

📉 *DIA COM MENOS COMPRAS:*
${menosDia}

⏰ *TOP 3 HORAS COM MAIS COMPRAS:*
${top3Horas}

💤 *TOP 3 HORAS MAIS MORTAS (06h–23h):*
${horasMortas}

📦 *TOTAL VENDIDO HOJE:* ${totalHoje} GB

👥 *CLIENTES ATIVOS HOJE:* ${clientesAtivosHoje}

👤 *QUEM MAIS COMPROU HOJE:*
${quemMaisComprou}`;

      if (command === "picospv") {
        console.log('📤 Enviando no PV do remetente...');
        
        // ⚠️ DECODIFICA O SENDER SE VIER COM @lid
        let jidPV = sender;
        if (jidPV.includes('@lid') && baileys?.jidDecode) {
          const decoded = baileys.jidDecode(jidPV);
          if (decoded?.user) {
            jidPV = `${decoded.user}@s.whatsapp.net`;
          }
        }

        await socket.sendMessage(jidPV, { text: resposta }, { quoted: null });
        await sendSuccessReply("RELATÓRIO ENVIADO NO PV!");
      } else {
        console.log('📤 Enviando no grupo...');
        await sendSuccessReply(resposta);
      }

    } catch (err) {
      console.error('ERRO NO COMANDO PICOS:', err);
      await sendErrorReply(`ERRO AO GERAR O RELATÓRIO:\n\n${err.stack}`);
    }
  }
};