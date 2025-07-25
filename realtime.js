const { WebSocketServer } = require('ws');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('./config/config');

function setupWebSocket(server) {
  const wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (req, socket, head) => {
    const { pathname, searchParams } = new URL(req.url, `http://${req.headers.host}`);
    if (pathname !== '/ws') {
      socket.destroy();
      return;
    }

    const token = searchParams.get('token');
    if (!token) {
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
      socket.destroy();
      return;
    }

    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch {
      socket.write('HTTP/1.1 403 Forbidden\r\n\r\n');
      socket.destroy();
      return;
    }

    wss.handleUpgrade(req, socket, head, ws => {
      ws.user = payload.user;
      ws.channels = new Set();
      wss.emit('connection', ws, req);
    });
  });

  wss.on('connection', ws => {
    ws.on('message', message => {
      let data;
      try {
        data = JSON.parse(message);
      } catch {
        ws.send(JSON.stringify({ error: 'invalid_json' }));
        return;
      }

      if (typeof data.event !== 'string' || typeof data.channel !== 'string' || data.payload === undefined) {
        ws.send(JSON.stringify({ error: 'invalid_format' }));
        return;
      }

      if (data.event === 'subscribe') {
        ws.channels.add(data.channel);
        ws.send(JSON.stringify({ event: 'subscribed', channel: data.channel, payload: {} }));
      } else if (data.event === 'unsubscribe') {
        ws.channels.delete(data.channel);
        ws.send(JSON.stringify({ event: 'unsubscribed', channel: data.channel, payload: {} }));
      }
    });
  });

  return wss;
}

module.exports = { setupWebSocket };
