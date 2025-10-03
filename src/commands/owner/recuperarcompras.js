const fs = require("fs");
const path = require("path");

const comprasPath = path.join(__dirname, "../../../storage/compras.json");

module.exports = {
  commands: ["recuperarcompras"],
  description: "Recupera registros de compras de uma lista formatada",
  type: "owner",

  async handle({ args, remoteJid, sendReply, react }) {
    try {
      if (react) await react("🛒");

      const textoOriginal = args.join(' ');

      // Limpa caracteres invisíveis e formatação extra
      const textoLimpo = textoOriginal
        .replace(/[\u2066-\u2069]/g, '')
        .replace(/[“”‘’]/g, '"')
        .replace(/[⁨⁩]/g, '')
        .trim();

      // Separar comando da lista
      const partes = textoLimpo.split(/[:：]/);
      if (partes.length < 2) {
        await sendReply("ENVIE O COMANDO JUNTO COM A LISTA DE COMPRAS!");
        if (react) await react("❌");
        return;
      }

      const textoCompleto = partes.slice(1).join(':').trim();
      if (!textoCompleto) {
        await sendReply("LISTA DE COMPRAS NÃO DETECTADA APÓS ':'!");
        if (react) await react("❌");
        return;
      }

      // Ler arquivo de compras
      let compras = {};
      if (fs.existsSync(comprasPath)) {
        compras = JSON.parse(fs.readFileSync(comprasPath));
      }
      if (!compras[remoteJid]) {
        compras[remoteJid] = {};
      }

      let entradas = 0;

      const linhas = textoCompleto
        .split('\n')
        .map(l => l.trim())
        .filter(l => l.length > 0);

      for (let i = 0; i < linhas.length; i++) {
        const linha = linhas[i];

        if (/^\d+[\)\.]\s*@/.test(linha)) {
          const atIndex = linha.indexOf('@');
          let contato = linha.slice(atIndex + 1).trim();
          contato = contato.replace(/[⁨⁩]/g, '');

          // Tenta pegar número
          let numeroMatch = contato.match(/\+?\d[\d\s]{5,}/);
          let jid = null;

          if (numeroMatch) {
            // Número encontrado
            let numeroRaw = numeroMatch[0].replace(/\s+/g, '');
            jid = `${numeroRaw}@s.whatsapp.net`;
          } else {
            // Sem número → usa o nome limpo
            let nomeSanitizado = contato
              .replace(/[^a-zA-Z0-9]/g, '')
              .toLowerCase()
              .slice(0, 25);
            if (!nomeSanitizado) continue; // se ficou vazio, pula
            jid = `${nomeSanitizado}@s.whatsapp.net`;
          }

          // Pega MB na linha seguinte
          const proxLinha = linhas[i + 1] || '';
          const mbMatch = proxLinha.match(/(\d+)MB/i);
          if (!mbMatch) continue;

          const mb = parseInt(mbMatch[1], 10);

          if (!compras[remoteJid][jid]) {
            compras[remoteJid][jid] = {
              total: 0,
              hoje: 0,
              historico: [],
              nome: ""
            };
          }

          compras[remoteJid][jid].total += mb;
          compras[remoteJid][jid].historico.push({
            quantidade: mb,
            data: new Date().toISOString()
          });

          entradas++;
        }
      }

      // Salvar atualizado
      fs.writeFileSync(comprasPath, JSON.stringify(compras, null, 2));

      if (entradas > 0) {
        await sendReply(`${entradas} COMPRAS IMPORTADAS COM SUCESSO!`);
        if (react) await react("✅");
      } else {
        await sendReply("NENHUMA COMPRA ENCONTRADA NO TEXTO!");
        if (react) await react("⚠️");
      }

    } catch (error) {
      console.error(error);
      await sendReply("ERRO AO IMPORTAR AS COMPRAS.");
      if (react) await react("❌");
    }
  },
};