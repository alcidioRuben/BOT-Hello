export default {
  name: "comprovativo",
  description: "Extrai referência e número do destinatário do comprovativo M-Pesa.",
  command: ["comprovativo"],
  category: "financeiro",
  async execute(m, { quoted }) {
    if (!quoted || !quoted.text) return m.reply("❌ Mencione a mensagem do comprovativo.");

    const texto = quoted.text;

    const referencia = texto.match(/Confirmado\s+([A-Z0-9]+)/i)?.[1];
    const numero = texto.match(/para\s+(9̣)/i)?.[1];
if (!referencia || !numero) return m.reply("❌ Não consegui extrair os dados. Verifique o formato.");

    m.reply(`✅ Dados extraídos:📌 Referência:{referencia}\n📞 Número: ${numero}`);
  }
}

