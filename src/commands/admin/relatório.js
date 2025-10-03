const { PREFIX } = require(`${BASE_DIR}/config`);

module.exports = {
  name: "relatório",
  description: "Mostra relatório de total de megas vendidos",
  commands: ["relatório", "rm"],
  usage: `${PREFIX}comando`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ sendAudioFromBuffer }) => {
    // código do comando
  },
};