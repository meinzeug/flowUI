import express from 'express';
import { WebSocketServer } from 'ws';
import http from 'http';
import pkg from 'pg';
import knex from 'knex';
import knexConfig from './knexfile.cjs';
import { MCP_TOOLS } from './tools.js';
import { randomUUID } from 'crypto';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { enqueueTask, startWorker } from './worker.js';

const { Pool } = pkg;

let pool;
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

const channelMap = new Map();

async function initPool() {
  if (process.env.NODE_ENV === 'test') {
    const { newDb } = await import('pg-mem');
    const db = newDb();
    const adapter = db.adapters.createPg();
    pool = new adapter.Pool();
    await pool.query('CREATE TABLE IF NOT EXISTS sessions (id SERIAL PRIMARY KEY, name TEXT, data JSONB)');
    await pool.query(`CREATE TABLE IF NOT EXISTS memory_entries (
      id uuid primary key,
      namespace text not null,
      query text not null,
      summary text not null,
      timestamp timestamp default now()
    )`);
    await pool.query(`CREATE TABLE IF NOT EXISTS users (
      id serial primary key,
      username text not null unique,
      email text not null unique,
      password_hash text not null,
      created_at timestamp default now()
    )`);
    await pool.query(`CREATE TABLE IF NOT EXISTS tool_calls (
      id serial primary key,
      name text not null,
      timestamp timestamp default now()
    )`);
    await pool.query(`CREATE TABLE IF NOT EXISTS training_metrics (
      id serial primary key,
      epoch int not null,
      loss float not null,
      accuracy float not null,
      timestamp timestamp default now()
    )`);
    for (let i = 1; i <= 5; i++) {
      await pool.query(
        'INSERT INTO training_metrics (epoch, loss, accuracy) VALUES ($1, $2, $3)',
        [i, 1 / i, i * 0.1 + 0.7]
      );
    }
  } else {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const db = knex({
      ...knexConfig,
      connection: process.env.DATABASE_URL,
    });
    await db.migrate.latest();
    await db.destroy();
    const check = await pool.query('SELECT COUNT(*) FROM training_metrics');
    if (parseInt(check.rows[0].count, 10) === 0) {
      for (let i = 1; i <= 5; i++) {
        await pool.query(
          'INSERT INTO training_metrics (epoch, loss, accuracy) VALUES ($1, $2, $3)',
          [i, 1 / i, i * 0.1 + 0.7]
        );
      }
    }
  }
}


async function createServer() {
  const app = express();
  app.use(express.json());
  const server = http.createServer(app);
  const wss = new WebSocketServer({ noServer: true });
  function broadcast(channel, payload) {
    const set = channelMap.get(channel);
    if (!set) return;
    for (const client of set) {
      if (client.readyState === client.OPEN) {
        client.send(JSON.stringify({ event: 'message', channel, payload }));
      }
    }
  }

  server.on('upgrade', (req, socket, head) => {
    const { pathname, searchParams } = new URL(req.url, `http://${req.headers.host}`);
    if (pathname === '/ws') {
      const header = req.headers['authorization'];
      let token = searchParams.get('token');
      if (!token && header && header.startsWith('Bearer ')) {
        token = header.slice(7);
      }
      if (!token) {
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
        socket.destroy();
        return;
      }
      try {
        jwt.verify(token, JWT_SECRET);
      } catch {
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
        socket.destroy();
        return;
      }
      wss.handleUpgrade(req, socket, head, ws => {
        ws.authToken = token;
        wss.emit('connection', ws, req);
      });
    } else {
      socket.write('HTTP/1.1 404 Not Found\r\n\r\n');
      socket.destroy();
    }
  });

  wss.on('connection', ws => {
    ws.channels = new Set();
    ws.isAlive = true;
    ws.on('pong', () => { ws.isAlive = true; });

    ws.on('message', data => {
      let msg;
      try {
        msg = JSON.parse(data);
      } catch {
        ws.send(JSON.stringify({ event: 'error', channel: null, payload: { message: 'invalid_json' } }));
        return;
      }

      const { event, channel, payload } = msg;
      if (typeof event !== 'string') {
        ws.send(JSON.stringify({ event: 'error', channel: null, payload: { message: 'invalid_format' } }));
        return;
      }

      if (event === 'subscribe') {
        if (typeof channel !== 'string') return;
        ws.channels.add(channel);
        if (!channelMap.has(channel)) channelMap.set(channel, new Set());
        channelMap.get(channel).add(ws);
        ws.send(JSON.stringify({ event: 'subscribed', channel, payload: {} }));
      } else if (event === 'unsubscribe') {
        if (typeof channel !== 'string') return;
        ws.channels.delete(channel);
        const set = channelMap.get(channel);
        if (set) {
          set.delete(ws);
          if (set.size === 0) channelMap.delete(channel);
        }
        ws.send(JSON.stringify({ event: 'unsubscribed', channel, payload: {} }));
      } else if (event === 'message') {
        broadcast(channel, payload);
      } else {
        ws.send(JSON.stringify({ event: 'error', channel, payload: { message: 'unknown_event' } }));
      }
    });

    ws.on('close', () => {
      for (const ch of ws.channels) {
        const set = channelMap.get(ch);
        if (set) {
          set.delete(ws);
          if (set.size === 0) channelMap.delete(ch);
        }
      }
    });
  });

  const heartbeat = setInterval(() => {
    wss.clients.forEach(client => {
      if (!client.isAlive) return client.terminate();
      client.isAlive = false;
      client.ping();
    });
  }, 30000);
  wss.on('close', () => clearInterval(heartbeat));

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

  app.get('/tools/info/:name', (req, res) => {
    const name = req.params.name;
    for (const group of MCP_TOOLS) {
      const tool = group.tools.find(t => t.name === name);
      if (tool) return res.json(tool);
    }
    res.status(404).json({ error: 'Not found' });
  });

  app.post('/tools/call', async (req, res) => {
    const { tool } = req.body;
    if (!tool) return res.status(400).json({ error: 'tool required' });
    try {
      if (!pool) await initPool();
      await pool.query('INSERT INTO tool_calls (name) VALUES ($1)', [tool]);
      res.json({ tool, status: 'executed' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/tools/batch', async (req, res) => {
    const { calls = [] } = req.body;
    if (!Array.isArray(calls) || calls.some(c => !c.tool)) {
      return res.status(400).json({ error: 'calls array with tool field required' });
    }
    try {
      if (!pool) await initPool();
      for (const c of calls) {
        await pool.query('INSERT INTO tool_calls (name) VALUES ($1)', [c.tool]);
      }
      const results = calls.map(c => ({ tool: c.tool, status: 'executed' }));
      res.json(results);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/auth/register', async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'username, email and password required' });
    }
    try {
      if (!pool) await initPool();
      const hash = await bcrypt.hash(password, 10);
      await pool.query(
        'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3)',
        [username, email, hash]
      );
      res.json({ status: 'ok' });
    } catch (err) {
      if (err.code === '23505') {
        res.status(400).json({ error: 'Username or email already exists' });
      } else {
        res.status(500).json({ error: err.message });
      }
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'username and password required' });
    }
    try {
      if (!pool) await initPool();
      const { rows } = await pool.query('SELECT password_hash FROM users WHERE username = $1', [username]);
      if (rows.length === 0) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      const valid = await bcrypt.compare(password, rows[0].password_hash);
      if (!valid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      const token = jwt.sign({ user: username }, JWT_SECRET, { expiresIn: '1h' });
      res.json({ token });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
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

  app.get('/session/list', async (req, res) => {
    try {
      if (!pool) await initPool();
      const { rows } = await pool.query('SELECT id, name FROM sessions ORDER BY id');
      res.json(rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/session/export/:id', async (req, res) => {
    const { id } = req.params;
    try {
      if (!pool) await initPool();
      const { rows } = await pool.query('SELECT name, data FROM sessions WHERE id = $1', [id]);
      if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
      res.setHeader('Content-Disposition', `attachment; filename="session-${id}.json"`);
      res.json(rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/session/import', async (req, res) => {
    const { name, data } = req.body;
    if (!name || !data) return res.status(400).json({ error: 'name and data required' });
    try {
      if (!pool) await initPool();
      const { rows } = await pool.query('INSERT INTO sessions (name, data) VALUES ($1, $2) RETURNING id', [name, data]);
      res.json({ id: rows[0].id });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/memory/store', async (req, res) => {
    const { namespace = 'default', query, summary } = req.body;
    if (!query || !summary) {
      return res.status(400).json({ error: 'query and summary required' });
    }
    try {
      if (!pool) await initPool();
      const id = randomUUID();
      await pool.query(
        'INSERT INTO memory_entries (id, namespace, query, summary) VALUES ($1, $2, $3, $4)',
        [id, namespace, query, summary]
      );
      res.json({ id });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/memory/query', async (req, res) => {
    const { namespace, query = '' } = req.body;
    try {
      if (!pool) await initPool();
      let rows;
      if (namespace) {
        ({ rows } = await pool.query(
          'SELECT * FROM memory_entries WHERE namespace = $1 AND query ILIKE $2 ORDER BY timestamp DESC LIMIT 10',
          [namespace, `%${query}%`]
        ));
      } else {
        ({ rows } = await pool.query(
          'SELECT * FROM memory_entries WHERE query ILIKE $1 ORDER BY timestamp DESC LIMIT 10',
          [`%${query}%`]
        ));
      }
      res.json(rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/queue/enqueue', (req, res) => {
    const { channel, payload } = req.body;
    if (!channel) return res.status(400).json({ error: 'channel required' });
    enqueueTask({ id: randomUUID(), channel, payload });
    res.json({ enqueued: true });
  });

  app.get('/metrics/training', async (req, res) => {
    try {
      if (!pool) await initPool();
      const { rows } = await pool.query(
        'SELECT epoch, loss, accuracy FROM training_metrics ORDER BY epoch'
      );
      res.json(rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  startWorker(broadcast);

  return { app, server };
}

export async function startServer(port = process.env.PORT || 3008) {
  if (!pool) {
    await initPool();
  }
  const { app, server } = await createServer();
  return server.listen(port, () => {
    console.log(`MCP server listening on ${port}`);
  });
}

if (process.env.NODE_ENV !== 'test') {
  startServer();
}
