const { addCommand } = require('../utils/commands'); // Ajuste se necessário
const processedPayments = new Set(); // Para controlar códigos já processados

addCommand({
    pattern: /m-pesa/i, // Detecta mensagens com "M-Pesa"
    fromMe: false,
    desc: 'Detecta pagamento M-Pesa e extrai dados do comprovativo',
    type: 'user',
    async onMessage(message, client) {
        try {
            // Log completo para debug
            console.log('Mensagem recebida:', message.message);

            // Captura o texto da mensagem
            const text = message.message?.conversation 
                      || message.message?.extendedTextMessage?.text 
                      || message.message?.imageMessage?.caption; // caso seja screenshot

            if (!text) return;

            // Regex flexível para extrair dados
            const codigoMatch = text.match(/Confirmado (\w+)/);
            const valorMatch = text.match(/Transferiste (\d+(?:\.\d{1,2})?)MT/);
            const numeroMatch = text.match(/para (\d{9,12})/);
            const nomeMatch = text.match(/-\s([A-Za-z]+)/);
            const dataHoraMatch = text.match(/aos (\d{1,2}\/\d{1,2}\/\d{2,4} as \d{1,2}:\d{2}\s?[APMapm]{2})/i);

            if (!codigoMatch || !valorMatch || !numeroMatch || !nomeMatch || !dataHoraMatch) {
                await client.sendMessage(message.key.remoteJid, 
                    `❌ Não foi possível extrair todos os dados do comprovativo.`, 
                    { quoted: message });
                return;
            }

            const codigo = codigoMatch[1];

            // Checa duplicado
            if (processedPayments.has(codigo)) {
                await client.sendMessage(message.key.remoteJid, 
                    `⚠️ Este comprovativo já foi processado anteriormente.`, 
                    { quoted: message });
                return;
            }

            processedPayments.add(codigo);

            // Envia resposta com dados extraídos
            await client.sendMessage(message.key.remoteJid, 
                `✅ Pagamento detectado!\n\n` +
                `🆔 Código da transação: ${codigo}\n` +
                `💰 Valor: ${valorMatch[1]}MT\n` +
                `📱 Número: ${numeroMatch[1]}\n` +
                `👤 Destinatário: ${nomeMatch[1]}\n` +
                `⏰ Data e hora: ${dataHoraMatch[1]}`, 
                { quoted: message });

        } catch (err) {
            console.error('Erro no comando payment.js:', err);
        }
    }
});

