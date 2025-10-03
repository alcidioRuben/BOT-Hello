const { PREFIX } = require(`${BASE_DIR}/config`);

module.exports = {
  name: "hora",
  description: "Mostra a hora actual de Moçambique",
  commands: ["hora", "ti"],
  usage: `${PREFIX}hora`,
  /**
   * @param {CommandHandleProps} props
   * @returns {Promise<void>}
   */

handle: async ({ sendText, sendReact }) => {
    const agora = new Date().toLocaleTimeString("pt-MZ", {
      timeZone: "Africa/Maputo",
      hour12: false
    });

    const hoje = new Date().toLocaleDateString("pt-MZ", {
      timeZone: "Africa/Maputo",
      day: "2-digit",
      month: "long",
      year: "numeric"
    });

    // Chamada para API do clima (precisa da chave)
    const apiKey = "SUA_API_KEY"; // Pegue no site do OpenWeather
    const cidade = "Teté";
    let temp = "Não disponível";

    try {
      const res = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=cidade   appid={apiKey}&units=metric`);
      temp = `${res.data.main.temp}°C`;
    } catch (e) {
      temp = "Erro ao obter temperatura";
    }

    await sendReact("🕒");
    await sendText(`🕓 *Hora actual:* ${agora}\n 📅 *Data:* ${hoje}\n🌡️ *Temperatura em ${cidade}:* ${temp}`);
  },
};
