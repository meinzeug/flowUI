const { initDb, getPool } = require('../db');

async function createProject(req, res, next) {
  const { name, description = '' } = req.body;
  if (!name) return res.status(400).json({ error: 'name required' });
  try {
    await initDb();
    const pool = getPool();
    const { rows } = await pool.query(
      `INSERT INTO projects (user_id, name, description)
       SELECT id, $2, $3 FROM users WHERE username = $1
       RETURNING id, name, description, created_at`,
      [req.user.user, name, description]
    );
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

async function listProjects(req, res, next) {
  try {
    await initDb();
    const pool = getPool();
    const { rows } = await pool.query(
      `SELECT p.id, p.name, p.description, p.created_at
       FROM projects p JOIN users u ON p.user_id = u.id
       WHERE u.username = $1 ORDER BY p.id`,
      [req.user.user]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

module.exports = { createProject, listProjects };
