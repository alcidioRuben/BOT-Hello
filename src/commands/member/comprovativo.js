const fs = require('fs');
const caminhoArquivo = './comprovativos.json'; // arquivo onde os comprovativos serão salvos

// Verifica se um comprovativo já foi usado
function comprovativoUsado(texto) {
    if(!fs.existsSync(caminhoArquivo)) return false;
    const dados = JSON.parse(fs.readFileSync(caminhoArquivo, 'utf-8'));
    return dados.some(item => item.texto === texto);
}

// Salva um novo comprovativo
function salvaComprovativo(texto) {
    const novo = { texto, data: new Date().toLocaleString() };
    let dados = [];
    if(fs.existsSync(caminhoArquivo)){
        dados = JSON.parse(fs.readFileSync(caminhoArquivo, 'utf-8'));
    }
    dados.push(novo);
    fs.writeFileSync(caminhoArquivo, JSON.stringify(dados, null, 2));
}

// Formata a resposta que o bot vai enviar no grupo
function formatarResposta({ numeroDestinatario, codigoTransacao, numeroCliente, hora, nomeConta, valor }) {
    return `Pagamento detectado.
Número do destinatário da: ${numeroDestinatario}
Código da transação: ${codigoTransacao}
Número do cliente pra receber os megas: ${numeroCliente}
Horas da transação: ${hora}
Nome da conta que ele transferiu o valor: ${nomeConta}
Valor: MT ${valor}`;
}

module.exports = { comprovativoUsado, salvaComprovativo, formatarResposta };
const { comprovativoUsado, salvaComprovativo, formatarResposta } = require('./comprovativo.js');
if(!comprovativoUsado(texto)){
    salvaComprovativo(texto);
    message.reply(formatarResposta({
        numeroDestinatario: '123456789',
        codigoTransacao: 'ABC123',
        numeroCliente: '987654321',
        hora: new Date().toLocaleTimeString(),
        nomeConta: 'João Silva',
        valor: '500'
    }));
} else {
    message.reply('❌ Comprovativo já foi usado.');
}
