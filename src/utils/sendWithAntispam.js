const fs = require('fs');
const path = require('path');
const antispamFile = path.join(__dirname, '../../storage/antispam.json');

function loadAntispamData() {
  if (!fs.existsSync(antispamFile)) return {};
  return JSON.parse(fs.readFileSync(antispamFile));
}

async function sendReplyWithAntispam(sock, remoteJid, text, quoted) {
  const data = loadAntispamData();
  if (data[remoteJid]) {
    const delay = data[remoteJid];
    await new Promise(resolve => setTimeout(resolve, delay * 1000));
  }
  await sock.sendMessage(remoteJid, { text }, { quoted });
}

module.exports = { sendReplyWithAntispam };
