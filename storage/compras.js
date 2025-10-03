const fs = require('fs');
const path = __dirname + '/compras.json';

function getCompras() {
  if (!fs.existsSync(path)) fs.writeFileSync(path, '{}');
  return JSON.parse(fs.readFileSync(path));
}

function saveCompras(data) {
  fs.writeFileSync(path, JSON.stringify(data, null, 2));
}

function registrarCompra(groupId, userId, nome, quantidade) {
  const compras = getCompras();

  if (!compras[groupId]) compras[groupId] = {};

  if (!compras[groupId][userId]) {
    compras[groupId][userId] = {
      nome,
      total: 0,
      historico: []
    };
  }

  compras[groupId][userId].total += quantidade;
  compras[groupId][userId].historico.push({
    quantidade,
    data: new Date().toISOString()
  });

  saveCompras(compras);

  return compras;
}

function getComprasHoje(groupId, userId) {
  const compras = getCompras();
  if (!compras[groupId] || !compras[groupId][userId]) return 0;

  const hoje = new Date().toISOString().slice(0, 10);

  return compras[groupId][userId].historico.filter(item =>
    item.data.slice(0, 10) === hoje
  ).length;
}

function getRanking(groupId) {
  const compras = getCompras();

  if (!compras[groupId]) return [];

  return Object.entries(compras[groupId])
    .map(([userId, data]) => ({ userId, ...data }))
    .sort((a, b) => b.total - a.total);
}

function getDadosUser(groupId, userId) {
  const compras = getCompras();
  if (!compras[groupId] || !compras[groupId][userId]) return null;
  return compras[groupId][userId];
}

module.exports = {
  registrarCompra,
  getComprasHoje,
  getRanking,
  getDadosUser
};