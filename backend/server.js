import express from 'express';
import { WebSocketServer } from 'ws';
import http from 'http';
import pkg from 'pg';

const { Pool } = pkg;

let pool;

async function initPool() {
  if (process.env.NODE_ENV === 'test') {
    const { newDb } = await import('pg-mem');
    const db = newDb();
    const adapter = db.adapters.createPg();
    pool = new adapter.Pool();
  } else {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
  }
  await pool.query('CREATE TABLE IF NOT EXISTS sessions (id SERIAL PRIMARY KEY, name TEXT, data JSONB)');
}

const app = express();
app.use(express.json());
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

wss.on('connection', ws => {
  ws.on('message', msg => {
    ws.send(JSON.stringify({ jsonrpc: '2.0', id: 1, result: 'ok' }));
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

app.post('/session/save', async (req, res) => {
  const { id, name, data } = req.body || {};
  try {
    let sessionId = id;
    if (sessionId) {
      await pool.query('UPDATE sessions SET name=$1, data=$2 WHERE id=$3', [name, data, sessionId]);
    } else {
      const result = await pool.query('INSERT INTO sessions(name,data) VALUES ($1,$2) RETURNING id', [name, data]);
      sessionId = result.rows[0].id;
    }
    res.json({ id: sessionId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/session/load', async (req, res) => {
  const { id } = req.body || {};
  if (!id) return res.status(400).json({ error: 'id required' });
  try {
    const result = await pool.query('SELECT id,name,data FROM sessions WHERE id=$1', [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export async function startServer(port = process.env.PORT || 3008) {
  await initPool();
  return server.listen(port, () => {
    console.log(`MCP server listening on ${port}`);
  });
}

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export default server;
