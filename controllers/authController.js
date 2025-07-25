const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/config');
const { initDb, getPool } = require('../db');

async function register(req, res, next) {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'username, email and password required' });
  }
  try {
    await initDb();
    const pool = getPool();
    const hash = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3)',
      [username, email, hash]
    );
    const token = jwt.sign({ user: username }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    if (err.code === '23505') {
      res.status(400).json({ error: 'Username or email already exists' });
    } else {
      next(err);
    }
  }
}

async function login(req, res, next) {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'username and password required' });
  }
  try {
    await initDb();
    const pool = getPool();
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
    next(err);
  }
}

module.exports = { register, login };
