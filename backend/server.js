import express from 'express';
import { WebSocketServer } from 'ws';
import http from 'http';
import pkg from 'pg';

const { Pool } = pkg;

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

wss.on('connection', ws => {
  ws.on('message', msg => {
    ws.send(JSON.stringify({ jsonrpc: '2.0', id: 1, result: 'ok' }));
  });
});

app.get('/health', async (req, res) => {
  try {
    if (process.env.DATABASE_URL) {
      await pool.query('SELECT 1');
    }
    res.json({ status: 'ok' });
  } catch (err) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

export function startServer(port = process.env.PORT || 3008) {
  return server.listen(port, () => {
    console.log(`MCP server listening on ${port}`);
  });
}

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export default server;
