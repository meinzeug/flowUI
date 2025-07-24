import express from 'express';
import { WebSocketServer } from 'ws';
import http from 'http';
import pkg from 'pg';
import knex from 'knex';
import knexConfig from './knexfile.cjs';
import { MCP_TOOLS } from './tools.js';

const { Pool } = pkg;

let pool;

async function initPool() {
  if (process.env.NODE_ENV === 'test') {
    const { newDb } = await import('pg-mem');
    const db = newDb();
    const adapter = db.adapters.createPg();
    pool = new adapter.Pool();
    await pool.query('CREATE TABLE IF NOT EXISTS sessions (id SERIAL PRIMARY KEY, name TEXT, data JSONB)');
  } else {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const db = knex({
      ...knexConfig,
      connection: process.env.DATABASE_URL,
    });
    await db.migrate.latest();
    await db.destroy();
  }
}

const app = express();
app.use(express.json());
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

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
    if (pool) {
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

app.post('/session/save', async (req, res) => {
  const { id, name, data } = req.body;
  try {
    if (!pool) await initPool();
    if (id) {
      await pool.query('UPDATE sessions SET name = $1, data = $2 WHERE id = $3', [name, data, id]);
      res.json({ id });
    } else {
      const { rows } = await pool.query('INSERT INTO sessions (name, data) VALUES ($1, $2) RETURNING id', [name, data]);
      res.json({ id: rows[0].id });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/session/load', async (req, res) => {
  const { id } = req.body;
  try {
    if (!pool) await initPool();
    const { rows } = await pool.query('SELECT id, name, data FROM sessions WHERE id = $1', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export async function startServer(port = process.env.PORT || 3008) {
  if (!pool) {
    await initPool();
  }
  return server.listen(port, () => {
    console.log(`MCP server listening on ${port}`);
  });
}

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export default server;
