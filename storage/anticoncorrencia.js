const fs = require('fs');
const path = require('path');

const FILE_PATH = path.join(__dirname, 'anticoncorrencia.json');

function readConcorrentes() {
  if (!fs.existsSync(FILE_PATH)) {
    fs.writeFileSync(FILE_PATH, JSON.stringify([]));
  }
  return JSON.parse(fs.readFileSync(FILE_PATH));
}

function saveConcorrentes(data) {
  fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2));
}

function addConcorrente(lid) {
  const lista = readConcorrentes();
  if (!Array.isArray(lista)) return;
  if (!lista.includes(lid)) {
    lista.push(lid);
    saveConcorrentes(lista);
  }
}

module.exports = {
  readConcorrentes,
  addConcorrente,
};