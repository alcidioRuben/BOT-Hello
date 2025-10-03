const fs = require('fs');
const path = __dirname + '/nano.json';

function getNanoCommands() {
  if (!fs.existsSync(path)) fs.writeFileSync(path, '{}');
  return JSON.parse(fs.readFileSync(path));
}

function saveNanoCommands(data) {
  fs.writeFileSync(path, JSON.stringify(data, null, 2));
}

function addNanoCommand(remoteJid, key, response) {
  const data = getNanoCommands();
  if (!data[remoteJid]) {
    data[remoteJid] = {};
  }
  data[remoteJid][key.trim().toLowerCase()] = response;
  saveNanoCommands(data);
}

function deleteNanoCommand(remoteJid, key) {
  const data = getNanoCommands();
  const cleanKey = key.trim().toLowerCase();

  if (data[remoteJid] && data[remoteJid][cleanKey]) {
    delete data[remoteJid][cleanKey];

    if (Object.keys(data[remoteJid]).length === 0) {
      delete data[remoteJid];
    }

    saveNanoCommands(data);
    return true;
  }
  return false;
}

function getNanoResponse(remoteJid, message) {
  const data = getNanoCommands();
  const cleanMessage = message.trim().toLowerCase();
  const groupCommands = data[remoteJid] || {};

  if (groupCommands[cleanMessage]) return groupCommands[cleanMessage];

  for (let key in groupCommands) {
    if (key.startsWith("!") && cleanMessage.startsWith("!")) {
      if (cleanMessage.includes(key)) return groupCommands[key];
    } else if (!key.startsWith("!") && !cleanMessage.startsWith("!")) {
      if (cleanMessage.includes(key)) return groupCommands[key];
    }
  }

  return null;
}

module.exports = {
  getNanoResponse,
  addNanoCommand,
  deleteNanoCommand
};