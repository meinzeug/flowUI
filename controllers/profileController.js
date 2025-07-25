const { initDb, getPool } = require('../db');

async function getProfile(req, res, next) {
  try {
    await initDb();
    const pool = getPool();
    const { rows } = await pool.query(
      'SELECT id, username, email, created_at FROM users WHERE username = $1',
      [req.user.user]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user: rows[0] });
  } catch (err) {
    next(err);
  }
}

module.exports = { getProfile };
