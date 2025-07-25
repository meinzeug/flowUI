const { initDb, getPool } = require('../db');
const { addJob, processQueue } = require('../workflowQueue');

async function executeWorkflow(req, res, next) {
  const { id } = req.params;
  try {
    await initDb();
    const pool = getPool();
    const { rows } = await pool.query(
      'SELECT id, project_id, name, definition FROM workflows WHERE id = $1',
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Not found' });
    }
    const workflow = rows[0];
    addJob(workflow);
    processQueue();
    await pool.query('UPDATE workflows SET last_run = now() WHERE id = $1', [id]);
    res.json({ queued: true });
  } catch (err) {
    next(err);
  }
}

module.exports = { executeWorkflow };
