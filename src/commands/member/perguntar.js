const fetch = require('node-fetch');
const { PREFIX } = require(`${BASE_DIR}/config`);

module.exports = {
  name: "perguntar",
  description: "Pergunte algo para a IA e receba uma resposta.",
  commands: ["perguntar"],
  usage: `${PREFIX}perguntar <pergunta>`,

  handle: async ({ args, sendReply, sendReact }) => {
    // Verifica se o usuário enviou uma pergunta
    if (!args.length) {
      await sendReact("❌");
      return sendReply("❌ DIGITE UMA PERGUNTA APÓS O COMANDO.");
    }

    const pergunta = args.join(" ");

    // Use API key from environment variable for security
    const API_KEY = process.env.OPENAI_API_KEY || "";

    try {
      await sendReact("🧠"); // Reação de carregando

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: pergunta }],
          temperature: 0.7
        })
      });

      const data = await response.json();

      // LOG de resposta detalhado para debug
      console.log("Resposta da API OpenAI:", JSON.stringify(data, null, 2));

      // Verifica se a resposta da IA é válida
      if (data.choices && data.choices.length > 0) {
        await sendReact("✅");
        return sendReply(`🤖 ✅ ${data.choices[0].message.content.trim()}`);
      }

      // Caso a API retorne um erro
      if (data.error) {
        console.error("Erro da API OpenAI:", data.error);
        await sendReact("❌");
        return sendReply(`❌ ERRO DA API: ${data.error.message}`);
      }

      // Caso nenhuma resposta válida seja recebida
      await sendReact("❌");
      return sendReply("🤖 ❌ NÃO CONSEGUI RESPONDER. TENTE NOVAMENTE.");
    } catch (error) {
      // Erro na requisição à API
      console.error("Erro ao chamar API OpenAI:", error);
      await sendReact("❌");
      return sendReply("🤖 ❌ ERRO AO PROCESSAR SUA PERGUNTA.");
    }
  }
};