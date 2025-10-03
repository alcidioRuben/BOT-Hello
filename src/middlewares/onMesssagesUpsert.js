/**
 * Evento chamado quando uma mensagem
 * é enviada para o grupo do WhatsApp
 *
 * @author Dev Gui
 */
const {
  isAtLeastMinutesInPast,
  GROUP_PARTICIPANT_ADD,
  GROUP_PARTICIPANT_LEAVE,
  isAddOrLeave,
} = require("../utils");
const { dynamicCommand } = require("../utils/dynamicCommand");
const { loadCommonFunctions } = require("../utils/loadCommonFunctions");
const { onGroupParticipantsUpdate } = require("./onGroupParticipantsUpdate");
const { errorLog } = require("../utils/logger");
const { badMacHandler } = require("../utils/badMacHandler");
const { checkIfMemberIsMuted } = require("../utils/database");
const { sendReplyWithAntispam } = require("../utils/sendWithAntispam");

const fs = require("fs");
const path = require("path");

const antifotoPath = path.join(__dirname, "../../antifoto.json");
const statusPath = path.join(__dirname, "../../antifoto_status.json");
const smsPath = path.join(__dirname, "../../db/sms-mensagens.json");

let antifotoStatus = {};
if (fs.existsSync(statusPath)) {
  antifotoStatus = JSON.parse(fs.readFileSync(statusPath));
}

async function isValidCommand(commandName) {
  const commandsDir = path.resolve(__dirname, "../commands");
  const folders = ["admin", "member", "owner"];

  for (const folder of folders) {
    const folderPath = path.join(commandsDir, folder);
    if (!fs.existsSync(folderPath)) continue;
    const files = fs.readdirSync(folderPath);

    for (const file of files) {
      if (!file.endsWith(".js")) continue;
      const commandPath = path.join(folderPath, file);
      try {
        const commandModule = require(commandPath);
        if (!commandModule.commands) continue;
        const cmds = Array.isArray(commandModule.commands)
          ? commandModule.commands
          : [commandModule.commands];
        if (cmds.includes(commandName)) {
          return true;
        }
      } catch (err) {
        continue;
      }
    }
  }
  return false;
}

exports.onMessagesUpsert = async ({ socket, messages, startProcess }) => {
  if (!messages.length) return;

  for (const webMessage of messages) {
    try {
      const timestamp = webMessage.messageTimestamp;
      if (isAtLeastMinutesInPast(timestamp)) continue;

      if (isAddOrLeave.includes(webMessage.messageStubType)) {
        let action = "";
        if (webMessage.messageStubType === GROUP_PARTICIPANT_ADD) action = "add";
        else if (webMessage.messageStubType === GROUP_PARTICIPANT_LEAVE) action = "remove";

        await onGroupParticipantsUpdate({
          userJid: webMessage.messageStubParameters[0],
          remoteJid: webMessage.key.remoteJid,
          socket,
          action,
        });
      } else {
        const commonFunctions = loadCommonFunctions({ socket, webMessage });
        if (!commonFunctions) continue;

        const { remoteJid, sender, isGroup, isAdmin, deleteMessage, getText } = commonFunctions;

        // 🔐 Membro mutado
        if (checkIfMemberIsMuted(remoteJid, sender)) {
          try {
            await deleteMessage(webMessage.key);
          } catch (error) {
            errorLog(
              `Erro ao deletar mensagem de membro silenciado, possivelmente o bot não é admin! ${error.message}`
            );
          }
          return;
        }

        // 📸 FILTRO ANTI-FOTO
        const hasImage =
          webMessage.message?.imageMessage ||
          webMessage.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage;

        if (isGroup && hasImage && antifotoStatus[remoteJid]) {
          const groupMetadata = await socket.groupMetadata(remoteJid);
          const senderInfo = groupMetadata.participants.find((p) => p.id === sender);
          const isSenderAdmin =
            senderInfo?.admin === "admin" || senderInfo?.admin === "superadmin";

          if (!isSenderAdmin) {
            await socket.sendMessage(remoteJid, {
              delete: {
                remoteJid,
                fromMe: false,
                id: webMessage.key.id,
                participant: webMessage.participant || sender,
              },
            });

            let antifoto = {};
            if (fs.existsSync(antifotoPath)) {
              antifoto = JSON.parse(fs.readFileSync(antifotoPath));
            }

            if (!antifoto[remoteJid]) antifoto[remoteJid] = {};
            if (!antifoto[remoteJid][sender]) antifoto[remoteJid][sender] = 0;

            antifoto[remoteJid][sender] += 1;

            await socket.sendMessage(remoteJid, {
              text: `🚫 @${sender.split("@")[0]} FOTOS SÃO PROIBIDAS! TENTATIVA (${antifoto[remoteJid][sender]}/3)`,
              mentions: [sender],
            });

            if (antifoto[remoteJid][sender] >= 3) {
              await socket.sendMessage(remoteJid, {
                text: `❌ @${sender.split("@")[0]} ENVIOU 3 FOTOS E FOI REMOVIDO!`,
                mentions: [sender],
              });

              await socket.groupParticipantsUpdate(remoteJid, [sender], "remove");
              antifoto[remoteJid][sender] = 0;
            }

            fs.writeFileSync(antifotoPath, JSON.stringify(antifoto, null, 2));
          }
        }

        const messageText = getText?.() || "";

        // 🔒 COMANDO SECRETO: !verificar (somente no privado)
        if (messageText.toLowerCase().startsWith("!verificar") && !isGroup) {
          if (fs.existsSync(smsPath)) {
            const sms = JSON.parse(fs.readFileSync(smsPath));
            if (!Array.isArray(sms) || sms.length === 0) {
              await socket.sendMessage(remoteJid, {
                text: "✅ Nenhuma mensagem de pagamento foi encontrada ainda.",
              });
            } else {
              const lista = sms
                .map((msg, i) => `📩 ${i + 1}. ${msg}`)
                .join("\n\n")
                .slice(0, 4000); // limita se for longo

              await socket.sendMessage(remoteJid, {
                text: `📥 MENSAGENS DETECTADAS:\n\n${lista}`,
              });
            }
          } else {
            await socket.sendMessage(remoteJid, {
              text: "❌ Arquivo de mensagens SMS não encontrado.",
            });
          }

          continue;
        }

        // comandos normais
        if (messageText.startsWith("!")) {
          const commandName = messageText.slice(1).split(" ")[0].toLowerCase();

          if (commandName === "antispam") {
            await sendReplyWithAntispam(socket, remoteJid, "", webMessage);
          }

          const comandoExiste = await isValidCommand(commandName);
          if (!comandoExiste) {
            try {
              await deleteMessage(webMessage.key);
            } catch (error) {
              errorLog(`Erro ao apagar comando inválido: ${error.message}`);
            }

            const groupMetadata = await socket.groupMetadata(remoteJid);
            const mentions = groupMetadata.participants.map((p) => p.id);

            await socket.sendMessage(remoteJid, {
              text: messageText.slice(1).trim(),
              mentions,
            });

            continue;
          }
        }

        await dynamicCommand(commonFunctions, startProcess);
      }
    } catch (error) {
      if (badMacHandler.handleError(error, "message-processing")) continue;

      if (badMacHandler.isSessionError(error)) {
        errorLog(`Erro de sessão ao processar mensagem: ${error.message}`);
        continue;
      }

      errorLog(`Erro ao processar mensagem: ${error.message}`);
      continue;
    }
  }
};