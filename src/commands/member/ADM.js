const { PREFIX } = require(`${BASE_DIR}/config`);

module.exports = {
  name: "adm",
  description: "Menciona todos os administradores do grupo",
  commands: ["adm", "ad"],
  usage: `${PREFIX}adm`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
   handle: async ({ sendMessage, groupMetadata }) => {
    const admins = groupMetadata.participants
      .filter(p => p.admin)
      .map(p => p.id);

    if (admins.length === 0) {
      return await sendMessage("❌ Nenhum administrador encontrado.");
    }

    const mentions = admins.map(jid => `@jid.split('@')[0]`).join(" ");
    await sendMessage(`📣 Chamando os admins:{mentions}`, { mentions: admins });
  },
};
