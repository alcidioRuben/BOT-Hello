/**
 * Direcionador de comandos.
 * @author Dev Gui
 */

const { ONLY_GROUP_ID, OWNER_NUMBER, OWNER_LID } = require("../config");
const {
  DangerError,
  WarningError,
  InvalidParameterError,
} = require("../errors");
const { findCommandImport } = require(".");
const {
  verifyPrefix,
  hasTypeOrCommand,
  isLink,
  isAdmin,
} = require("../middlewares");
const { checkPermission } = require("../middlewares/checkPermission");
const {
  isActiveGroup,
  getAutoResponderResponse,
  isActiveAutoResponderGroup,
  isActiveAntiLinkGroup,
  isActiveOnlyAdmins,
} = require("./database");
const { errorLog } = require("../utils/logger");
const { badMacHandler } = require("./badMacHandler");

const { getNanoResponse } = require("../../storage/nano");

exports.dynamicCommand = async (paramsHandler, startProcess) => {
  const {
    commandName,
    prefix,
    sendWarningReply,
    sendErrorReply,
    remoteJid,
    sendReply,
    socket,
    userJid,
    fullMessage,
    webMessage,
    pushName,
    sendSuccessReact,
  } = paramsHandler;

  // 0️⃣ Ignora mensagens do próprio bot em grupo
  if (webMessage?.key?.fromMe && remoteJid?.includes('@g.us')) {
    return;
  }

  const activeGroup = isActiveGroup(remoteJid);

  // 1️⃣ Ignora comandos internos como .nanoadd e .nanodel
  const cleanMessage = fullMessage.trim().toLowerCase();
  const commandWord = cleanMessage.split(/\s+/)[0];

  const comandosInternos = [`${prefix}nanoadd`, `${prefix}nanodel`];
  const isInternalCommand = comandosInternos.includes(commandWord);

  if (!isInternalCommand) {
    const nanoResposta = getNanoResponse(remoteJid, cleanMessage);

    if (nanoResposta) {
      let mentionName = `@${userJid?.split('@')[0] || 'user'}`;

      try {
        if (pushName && pushName.trim().length > 0) {
          mentionName = `@${pushName}`;
        } else if (socket.getName) {
          const fetchedName = await socket.getName(userJid);
          if (fetchedName && fetchedName.trim().length > 0) {
            mentionName = `@${fetchedName}`;
          }
        }
      } catch (e) {}

      const finalMessage = nanoResposta.replace(/@user/gi, mentionName);
      const mentionJid = userJid?.includes('@') ? userJid : `${userJid}@s.whatsapp.net`;

      if (typeof sendSuccessReact === "function") {
        await sendSuccessReact();
      }

      await sendReply(finalMessage, [mentionJid]);
      return;
    }
  }

  // 2️⃣ Antilink
  if (activeGroup && isActiveAntiLinkGroup(remoteJid) && isLink(fullMessage)) {
    if (!userJid) return;

    if (!(await isAdmin({ remoteJid, userJid, socket }))) {
      await socket.groupParticipantsUpdate(remoteJid, [userJid], "remove");
      await sendReply("Anti-link ativado! Você foi removido por enviar um link!");
      await socket.sendMessage(remoteJid, {
        delete: {
          remoteJid,
          fromMe: false,
          id: webMessage.key.id,
          participant: webMessage.key.participant,
        },
      });
      return;
    }
  }

  // 3️⃣ Comandos reais
  const { type, command } = findCommandImport(commandName);

  if (ONLY_GROUP_ID && ONLY_GROUP_ID !== remoteJid) return;

  if (
    activeGroup &&
    (!verifyPrefix(prefix) || !hasTypeOrCommand({ type, command }))
  ) {
    if (isActiveAutoResponderGroup(remoteJid)) {
      const response = getAutoResponderResponse(fullMessage);
      if (response) await sendReply(response);
    }
    return;
  }

  if (activeGroup && !(await checkPermission({ type, ...paramsHandler }))) {
    await sendErrorReply("Você não tem permissão para executar este comando!");
    return;
  }

  if (
    activeGroup &&
    isActiveOnlyAdmins(remoteJid) &&
    !(await isAdmin({ remoteJid, userJid, socket }))
  ) {
    await sendWarningReply("Somente administradores podem executar comandos!");
    return;
  }

  if (!activeGroup && command.name !== "on") {
    await sendWarningReply(
      "Este grupo está desativado! Peça para o dono do grupo ativar o bot!"
    );
    return;
  }

  // 4️⃣ Executa o comando
  try {
    const senderNumber = userJid?.split('@')[0];
    const ownerLidNumber = OWNER_LID?.split('@')[0];
    const isOwner = OWNER_NUMBER === senderNumber || ownerLidNumber === senderNumber;

    await command.handle({
      ...paramsHandler,
      type,
      startProcess,
      isOwner,
    });
  } catch (error) {
    if (badMacHandler.handleError(error, `command:${command.name}`)) {
      await sendWarningReply("Erro temporário de sincronização. Tente novamente em alguns segundos.");
      return;
    }

    if (badMacHandler.isSessionError(error)) {
      errorLog(`Erro de sessão durante execução de comando ${command.name}: ${error.message}`);
      await sendWarningReply("Erro de comunicação. Tente executar o comando novamente.");
      return;
    }

    if (error instanceof InvalidParameterError) {
      await sendWarningReply(`Parâmetros inválidos! ${error.message}`);
    } else if (error instanceof WarningError) {
      await sendWarningReply(error.message);
    } else if (error instanceof DangerError) {
      await sendErrorReply(error.message);
    } else {
      errorLog("Erro ao executar comando", error);
      await sendErrorReply(`Ocorreu um erro ao executar o comando ${command.name}!\n\n📄 *Detalhes*: ${error.message}`);
    }
  }
};