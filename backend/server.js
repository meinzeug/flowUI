import express from 'express';
import { WebSocketServer } from 'ws';
import http from 'http';
import pkg from 'pg';
import { MCP_TOOLS } from './tools.js';

const { Pool } = pkg;

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

wss.on('connection', ws => {
  ws.on('message', data => {
    let msg;
    try {
      msg = JSON.parse(data);
    } catch (err) {
      ws.send(JSON.stringify({ jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error' } }));
      return;
    }

    const { id, method, params = {} } = msg;

    if (method === 'tools/list') {
      ws.send(JSON.stringify({ jsonrpc: '2.0', id, result: MCP_TOOLS }));
    } else if (method === 'tools/call') {
      const { tool } = params;
      ws.send(JSON.stringify({ jsonrpc: '2.0', id, result: { tool, status: 'executed' } }));
    } else if (method === 'tools/batch') {
      const { calls = [] } = params;
      const results = calls.map(c => ({ tool: c.tool, status: 'executed' }));
      ws.send(JSON.stringify({ jsonrpc: '2.0', id, result: results }));
    } else {
      ws.send(JSON.stringify({ jsonrpc: '2.0', id, error: { code: -32601, message: 'Method not found' } }));
    }
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

app.get('/tools/list', (req, res) => {
  res.json(MCP_TOOLS);
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
