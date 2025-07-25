import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const app = express();
app.use(express.json());

const users = new Map<string, { email: string; passwordHash: string }>();
const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';
const MCP_PORT = process.env.MCP_PORT || '3008';

function generateToken(user: string) {
  return jwt.sign({ user }, JWT_SECRET, { expiresIn: '1h' });
}

app.post('/api/auth/register', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'username, email and password required' });
  }
  if (users.has(username)) {
    return res.status(400).json({ error: 'user_exists' });
  }
  const hash = await bcrypt.hash(password, 10);
  users.set(username, { email, passwordHash: hash });
  const token = generateToken(username);
  res.json({ token });
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'username and password required' });
  }
  const user = users.get(username);
  if (!user) return res.status(401).json({ error: 'invalid_credentials' });
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json({ error: 'invalid_credentials' });
  const token = generateToken(username);
  res.json({ token });
});

function auth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const header = req.headers['authorization'];
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'missing_token' });
  const token = header.slice(7);
  try {
    req.user = jwt.verify(token, JWT_SECRET) as any;
    next();
  } catch {
    return res.status(401).json({ error: 'invalid_token' });
  }
}

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/proxy/tools/batch', auth, async (req, res) => {
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

export function start(port: number = 4000) {
  return app.listen(port, () => {
    console.log(`REST backend listening on ${port}`);
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  start(Number(process.env.PORT) || 4000);
}
