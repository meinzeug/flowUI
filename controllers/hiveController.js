const { broadcast } = require('../ws');
const { initDb, getPool } = require('../db');

async function logActivity(req, res, next) {
  const { message, type = 'info' } = req.body;
  try {
    await initDb();
    const pool = getPool();
    const { rows } = await pool.query(
      'INSERT INTO activity_log (type, message) VALUES ($1, $2) RETURNING id, timestamp, type, message',
      [type, message]
    );
    const entry = rows[0];
    broadcast('hive-log', entry);
    res.json(entry);
  } catch (err) {
    next(err);
  }
}

async function listLogs(req, res, next) {
  try {
    await initDb();
    const pool = getPool();
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '50', 10);
    const offset = (page - 1) * limit;
    const { rows } = await pool.query(
      'SELECT id, timestamp, type, message FROM activity_log ORDER BY id DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

async function clearLogs(req, res, next) {
  try {
    await initDb();
    const pool = getPool();
    await pool.query('DELETE FROM activity_log');
    broadcast('hive-log-batch', []);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

module.exports = { logActivity, listLogs, clearLogs };
