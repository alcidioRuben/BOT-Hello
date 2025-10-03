/**
 * Evento chamado quando um usuário
 * entra ou sai de um grupo de WhatsApp.
 */
const { getProfileImageData } = require("../services/baileys");
const fs = require("fs");
const { onlyNumbers } = require("../utils");
const {
  isActiveWelcomeGroup,
  isActiveExitGroup,
  isActiveGroup,
  isActiveAntiEstrangeiros,
} = require("../utils/database");
const { welcomeMessage, exitMessage } = require("../messages");
const { catBoxUpload } = require("../services/catbox");
const {
  spiderAPITokenConfigured,
  exit,
  welcome,
} = require("../services/spider-x-api");

exports.onGroupParticipantsUpdate = async ({
  userJid,
  remoteJid,
  socket,
  action,
}) => {
  try {
    if (!remoteJid.endsWith("@g.us")) {
      return;
    }

    if (!isActiveGroup(remoteJid)) {
      return;
    }

    // ✅ ANTI-ESTRANGEIROS
    if (action === "add" && isActiveAntiEstrangeiros(remoteJid)) {
      console.log("[ANTI-ESTRANGEIROS] userJid recebido:", userJid);

      const jidNumber = onlyNumbers(userJid);
      console.log("[ANTI-ESTRANGEIROS] Número extraído:", jidNumber);

      let isMozambican = false;
      let checked = false;

      // 1️⃣ Checagem direta
      if (jidNumber.startsWith("258")) {
        console.log("[ANTI-ESTRANGEIROS] ✅ Número direto com +258.");
        isMozambican = true;
        checked = true;
      }

      // 2️⃣ Checagem via API
      if (!isMozambican) {
        console.log("[ANTI-ESTRANGEIROS] ❓ Consultando via WhatsApp...");
        try {
          const query = await socket.onWhatsApp(jidNumber);
          if (query && Array.isArray(query) && query.length > 0 && query[0]?.jid) {
            const realJid = query[0].jid;
            const realNumber = onlyNumbers(realJid);
            console.log(`[ANTI-ESTRANGEIROS] 📌 Resultado via API: ${realNumber}`);

            checked = true;
            if (realNumber.startsWith("258")) {
              isMozambican = true;
              console.log("[ANTI-ESTRANGEIROS] ✅ Confirmado moçambicano via API.");
            } else {
              console.log("[ANTI-ESTRANGEIROS] ❌ Não parece moçambicano via API.");
            }
          } else {
            console.log("[ANTI-ESTRANGEIROS] ⚠️ Resposta vazia ou sem jid na API.");
          }
        } catch (err) {
          console.error("[ANTI-ESTRANGEIROS] ⚠️ Erro na consulta via onWhatsApp:", err.message);
        }
      }

      // 3️⃣ Decisão final
      if (isMozambican) {
        console.log(`[ANTI-ESTRANGEIROS] ✅ Permanece no grupo: ${jidNumber}`);
      } else if (!checked) {
        console.log(`[ANTI-ESTRANGEIROS] ⚠️ Não foi possível confirmar nada. Mantendo no grupo por precaução.`);
      } else {
        console.log(`[ANTI-ESTRANGEIROS] ❌ Removendo do grupo: ${jidNumber}`);
        await socket.groupParticipantsUpdate(remoteJid, [userJid], "remove");
        return;
      }
    }

    // ✅ Mensagem de boas-vindas
    if (isActiveWelcomeGroup(remoteJid) && action === "add") {
      const { buffer, profileImage } = await getProfileImageData(
        socket,
        userJid
      );

      const hasMemberMention = welcomeMessage.includes("@member");
      const mentions = [];

      let finalWelcomeMessage = welcomeMessage;

      if (hasMemberMention) {
        finalWelcomeMessage = welcomeMessage.replace(
          "@member",
          `@${onlyNumbers(userJid)}`
        );
        mentions.push(userJid);
      }

      if (spiderAPITokenConfigured) {
        try {
          const link = await catBoxUpload(buffer);
          if (!link) throw new Error("Link inválido");
          const url = welcome("participante", "Você é o mais novo membro do grupo!", link);
          await socket.sendMessage(remoteJid, {
            image: { url },
            caption: finalWelcomeMessage,
            mentions,
          });
        } catch (error) {
          console.error("Erro ao fazer upload da imagem:", error);
          await socket.sendMessage(remoteJid, {
            image: buffer,
            caption: finalWelcomeMessage,
            mentions,
          });
        }
      } else {
        await socket.sendMessage(remoteJid, {
          image: buffer,
          caption: finalWelcomeMessage,
          mentions,
        });
      }

      if (!profileImage.includes("default-user")) {
        fs.unlinkSync(profileImage);
      }
    }

    // ✅ Mensagem de saída
    else if (isActiveExitGroup(remoteJid) && action === "remove") {
      const { buffer, profileImage } = await getProfileImageData(
        socket,
        userJid
      );

      const hasMemberMention = exitMessage.includes("@member");
      const mentions = [];

      let finalExitMessage = exitMessage;

      if (hasMemberMention) {
        finalExitMessage = exitMessage.replace(
          "@member",
          `@${onlyNumbers(userJid)}`
        );
        mentions.push(userJid);
      }

      if (spiderAPITokenConfigured) {
        try {
          const link = await catBoxUpload(buffer);
          if (!link) throw new Error("Link inválido");
          const url = exit("membro", "Você foi um bom membro", link);
          await socket.sendMessage(remoteJid, {
            image: { url },
            caption: finalExitMessage,
            mentions,
          });
        } catch (error) {
          console.error("Erro ao fazer upload da imagem:", error);
          await socket.sendMessage(remoteJid, {
            image: buffer,
            caption: finalExitMessage,
            mentions,
          });
        }
      } else {
        await socket.sendMessage(remoteJid, {
          image: buffer,
          caption: finalExitMessage,
          mentions,
        });
      }

      if (!profileImage.includes("default-user")) {
        fs.unlinkSync(profileImage);
      }
    }

  } catch (error) {
    console.error("Erro ao processar evento onGroupParticipantsUpdate:", error);
    process.exit(1);
  }
};