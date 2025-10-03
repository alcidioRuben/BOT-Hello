module.exports = {
  name: 'tempo',
  category: 'member',
  async handle({ sock, m }) {
    const uptime = process.uptime() * 1000;
    const horas = Math.floor((uptime / (1000 * 60 * 60)) % 24);
    const minutos = Math.floor((uptime / (1000 * 60)) % 60);
    const segundos = Math.floor((uptime / 1000) % 60);

    const resposta = `⏱️ *Bot online há:*\nhorash{minutos}m ${segundos}s`;
    await sock.sendMessage(m.chat, { text: resposta }, { quoted: m });
  }
};


