const { PREFIX } = require(`${BASE_DIR}/config`);

module.exports = {
  name: "grupo",
  aliases: ["infogrupo"],
  description: "Exibe informações sobre o grupo.",
  category: "admin",
  async execute(m, { conn }) {
    if (!m.isGroup) {
      return m.reply("❌ Este comando só pode ser usado em grupos.");
    }

    try {
      const metadata = await conn.groupMetadata(m.chat);
      const groupName = metadata.subject;
      const groupId = metadata.id;
      const owner = metadata.owner ? "@" + metadata.owner.split("@")[0] : "Indefinido";
      const participants = metadata.participants.length;
      const creationDate = new Date(metadata.creation * 1000).toLocaleDateString("pt-PT");

      const message = `👥 *Informações do Grupo*\n\n` +
        `🏷️ *Nome:* groupName` +
        `🆔 *ID:*{groupId}\n` +
        `👑 *Dono:* owner` +
        `📅 *Criado em:*{creationDate}\n` +
        `👤 *Participantes:* ${participants}`;

await conn.sendMessage(m.chat, { text: message, mentions: [metadata.owner] }, { quoted: m });

    } catch (err) {
      console.error(err);
      return m.reply("❌ Ocorreu um erro ao tentar obter os dados do grupo.");
    }
  }
};
