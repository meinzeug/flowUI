import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pkg from 'pg';

const { Pool } = pkg;

const app = express();
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';
const MCP_PORT = process.env.MCP_PORT || '3008';

let pool: pkg.Pool;

async function initPool() {
  if (pool) return;
  if (process.env.NODE_ENV === 'test') {
    const { newDb } = await import('pg-mem');
    const db = newDb();
    const adapter = db.adapters.createPg();
    pool = new adapter.Pool();
  } else {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
  }
  await pool.query(`CREATE TABLE IF NOT EXISTS users (
      id serial primary key,
      username text not null unique,
      email text not null unique,
      password_hash text not null,
      role text not null default 'user',
      created_at timestamp default now()
    )`);
  await pool.query(`CREATE TABLE IF NOT EXISTS login_sessions (
      id serial primary key,
      user_id int references users(id),
      token text not null unique,
      expires_at timestamp not null
    )`);
}

function generateToken(user: string, role: string) {
  return jwt.sign({ user, role }, JWT_SECRET, { expiresIn: '1h' });
}

app.post('/api/auth/register', async (req: express.Request, res: express.Response) => {
  await initPool();
  const { username, email, password, role = 'user' } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'username, email and password required' });
  }
  const { rows: existing } = await pool.query('SELECT 1 FROM users WHERE username=$1', [username]);
  if (existing.length > 0) {
    return res.status(400).json({ error: 'user_exists' });
  }
  const hash = await bcrypt.hash(password, 10);
  await pool.query('INSERT INTO users (username, email, password_hash, role) VALUES ($1,$2,$3,$4)', [username, email, hash, role]);
  const token = generateToken(username, role);
  const expires = new Date(Date.now() + 60 * 60 * 1000);
  const { rows } = await pool.query('SELECT id FROM users WHERE username=$1', [username]);
  await pool.query('INSERT INTO login_sessions (user_id, token, expires_at) VALUES ($1,$2,$3)', [rows[0].id, token, expires]);
  res.json({ token });
});

app.post('/api/auth/login', async (req: express.Request, res: express.Response) => {
  await initPool();
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'username and password required' });
  }
  const { rows } = await pool.query('SELECT id, password_hash, role FROM users WHERE username=$1', [username]);
  if (rows.length === 0) return res.status(401).json({ error: 'invalid_credentials' });
  const valid = await bcrypt.compare(password, rows[0].password_hash);
  if (!valid) return res.status(401).json({ error: 'invalid_credentials' });
  const token = generateToken(username, rows[0].role);
  const expires = new Date(Date.now() + 60 * 60 * 1000);
  await pool.query('INSERT INTO login_sessions (user_id, token, expires_at) VALUES ($1,$2,$3)', [rows[0].id, token, expires]);
  res.json({ token });
});

async function auth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const header = req.headers['authorization'];
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'missing_token' });
  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    await initPool();
    const { rows } = await pool.query('SELECT expires_at FROM login_sessions WHERE token=$1', [token]);
    if (rows.length === 0 || new Date(rows[0].expires_at) < new Date()) {
      return res.status(401).json({ error: 'invalid_token' });
    }
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ error: 'invalid_token' });
  }
}

function requireRole(role: string) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (!req.user || (req.user as any).role !== role) {
      return res.status(403).json({ error: 'forbidden' });
    }
    next();
  };
}

app.get('/api/profile', auth, async (req, res) => {
  await initPool();
  const { user } = req.user as any;
  const { rows } = await pool.query('SELECT id, username, email, role, created_at FROM users WHERE username=$1', [user]);
  res.json({ user: rows[0] });
});

app.get('/api/users', auth, requireRole('admin'), async (_req, res) => {
  await initPool();
  const { rows } = await pool.query('SELECT id, username, email, role, created_at FROM users ORDER BY id');
  res.json(rows);
});

app.get('/health', (_req: express.Request, res: express.Response) => {
  res.json({ status: 'ok' });
});

app.post('/api/proxy/tools/batch', auth, async (req: express.Request, res: express.Response) => {
  try {
    const resp = await fetch(`http://localhost:${MCP_PORT}/tools/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: req.headers['authorization'] as string },
      body: JSON.stringify(req.body)
    });
    const data = await resp.json();
    res.status(resp.status).json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export async function start(port: number = 4000) {
  await initPool();
  return app.listen(port, () => {
    console.log(`REST backend listening on ${port}`);
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  start(Number(process.env.PORT) || 4000);
}
