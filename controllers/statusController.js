const { initDb, getPool } = require('../db');

async function getStatus(req, res, next) {
  try {
    await initDb();
    const pool = getPool();
    const { rows } = await pool.query('SELECT COUNT(*) FROM users');
    const userCount = parseInt(rows[0].count, 10);
    res.json({ status: 'ok', userCount });
  } catch (err) {
    next(err);
  }
}

module.exports = { getStatus };
