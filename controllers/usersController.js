const { initDb, getPool } = require('../db');

async function listUsers(req, res, next) {
  try {
    await initDb();
    const pool = getPool();
    const { rows } = await pool.query('SELECT id, username, email FROM users ORDER BY id');
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

module.exports = { listUsers };
