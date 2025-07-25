require('dotenv').config();
const express = require('express');
const http = require('http');
const { WebSocketServer } = require('ws');
const { setWss, broadcast } = require('./ws');
const jwt = require('jsonwebtoken');

const apiRoutes = require('./routes');
const errorHandler = require('./middlewares/errorHandler');
const { PORT, JWT_SECRET } = require('./config/config');
const { initDb } = require('./db');
const { storeConnection } = require('./middlewares/wsConnections');

async function createServer() {
  await initDb();
  const app = express();
  app.use(express.json());

  app.all('/', (req, res) => res.status(403).json({ error: 'Forbidden' }));
  app.use('/api', apiRoutes);

  app.use(errorHandler);

  const server = http.createServer(app);

  const wss = new WebSocketServer({ noServer: true });
  setWss(wss);
  const { MCP_TOOLS } = await import('./backend/tools.js');

  const { getPool } = require('./db');

  wss.on('connection', async ws => {
    await initDb();
    const pool = getPool();
    try {
      const { rows } = await pool.query(
        'SELECT id, timestamp, type, message FROM activity_log ORDER BY id DESC LIMIT 20'
      );
      ws.send(
        JSON.stringify({ event: 'hive-log-batch', data: rows.reverse() })
      );
    } catch (err) {
      // ignore
    }

    ws.on('message', data => {
      let msg;
      try {
        msg = JSON.parse(data);
      } catch (err) {
        ws.send(
          JSON.stringify({ jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error' } })
        );
        return;
      }

      const { id, method, params = {} } = msg;

      if (method === 'tools/list') {
        ws.send(JSON.stringify({ jsonrpc: '2.0', id, result: MCP_TOOLS }));
      } else if (method === 'tools/call') {
        const { tool } = params;
        ws.send(
          JSON.stringify({ jsonrpc: '2.0', id, result: { tool, status: 'executed' } })
        );
      } else if (method === 'tools/batch') {
        const { calls = [] } = params;
        const results = calls.map(c => ({ tool: c.tool, status: 'executed' }));
        ws.send(JSON.stringify({ jsonrpc: '2.0', id, result: results }));
      } else {
        ws.send(
          JSON.stringify({ jsonrpc: '2.0', id, error: { code: -32601, message: 'Method not found' } })
        );
      }
    });
  });

  server.on('upgrade', (req, socket, head) => {
    const { pathname, searchParams } = new URL(req.url, `http://${req.headers.host}`);
    if (pathname === '/ws') {
      const token = searchParams.get('token');
      if (!token) {
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
        socket.destroy();
        return;
      }
      let payload;
      try {
        payload = jwt.verify(token, JWT_SECRET);
        req.user = payload;
      } catch {
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
        socket.destroy();
        return;
      }
      wss.handleUpgrade(req, socket, head, ws => {
        storeConnection(payload.user, ws);
        wss.emit('connection', ws, req);
      });
    } else {
      socket.destroy();
    }
  });

  return { app, server };
}

async function startServer(port = PORT) {
  const { server } = await createServer();
  return server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

if (require.main === module) {
  startServer();
}

module.exports = { createServer, startServer, broadcast };
