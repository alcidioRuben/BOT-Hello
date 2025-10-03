const fs = require("fs");
const path = require("path");
const alarmePath = path.join(__dirname, "./storage/alarmes.json");

setInterval(async () => {
  if (!fs.existsSync(alarmePath)) return;

  const alarmes = JSON.parse(fs.readFileSync(alarmePath));
  const agora = new Date();
  const horaAtual = agora.toTimeString().slice(0, 5); // HH:MM

  for (const [grupo, { horaAbrir, horaFechar }] of Object.entries(alarmes)) {
    try {
      if (horaAtual === horaAbrir) {
        await conn.groupSettingUpdate(grupo, "not_announcement"); // Abrir
        await conn.sendMessage(grupo, { text: "✅ Grupo aberto automaticamente pelo alarme." });
      }
      if (horaAtual === horaFechar) {
        await conn.groupSettingUpdate(grupo, "announcement"); // Fechar
        await conn.sendMessage(grupo, { text: "🔒 Grupo fechado automaticamente pelo alarme." });
      }
    } catch (err) {console.error("Erro ao executar alarme no grupo:", grupo, err);
    }
  }
}, 60 * 1000); // Verifica a cada minuto
