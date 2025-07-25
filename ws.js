const { OPEN } = require('ws');
const { getConnections } = require('./middlewares/wsConnections');
let wss;

function setWss(server) {
  wss = server;
}

function broadcast(event, data) {
  if (!wss) return;
  const msg = JSON.stringify({ event, data });
  wss.clients.forEach(client => {
    if (client.readyState === OPEN) {
      client.send(msg);
    }
  });
}

function sendToUser(userId, event, data) {
  if (!wss) return;
  const msg = JSON.stringify({ event, data });
  const connections = getConnections(userId);
  connections.forEach(ws => {
    if (ws.readyState === OPEN) {
      ws.send(msg);
    }
  });
}

module.exports = { setWss, broadcast, sendToUser };
