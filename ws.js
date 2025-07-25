const { OPEN } = require('ws');
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

module.exports = { setWss, broadcast };
