const { PREFIX } = require(`${BASE_DIR}/config`);

const desafios = [
  "Cante o refrão da sua música favorita agora!",
  "Envie uma selfie engraçada no grupo.",
  "Conte uma piada que faça todo mundo rir.",
  "Faça 10 polichinelos e grave um vídeo.",
  "Descreva seu dia só usando emojis.",
  "Mande um elogio sincero para alguém no grupo.",
  "Finja ser um personagem de filme por 1 minuto.",
  "Diga um trava-língua sem errar.",
  "Mude sua foto de perfil para algo engraçado por 1 hora.",
  "Faça uma dança maluca e grave um vídeo."
];

exports = {
  name: "desafio",
  description: "Envia um desafio divertido para o grupo",
  commands: ["desafio", "des"],
  usage: `${PREFIX}desafio`,
   /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */
  handle: async ({ sendText }) => {
    const desafio = desafios[Math.floor(Math.random() * desafios.length)];
    await sendText(`🎯 *Desafio do dia:*\n\n${desafio}`);
    await sendSuccessReply(`Desafio do dia`);
  },
};