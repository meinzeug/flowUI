import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();
const { Pool } = pkg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function processNext() {
  const { rows } = await pool.query("SELECT id, workflow_id FROM workflow_queue WHERE status='queued' ORDER BY id LIMIT 1");
  if (rows.length) {
    const job = rows[0];
    await pool.query("UPDATE workflow_queue SET status='processing', updated_at=now() WHERE id=$1", [job.id]);
    // TODO: real workflow execution
    await new Promise(r => setTimeout(r, 100));
    await pool.query("UPDATE workflow_queue SET status='done', updated_at=now() WHERE id=$1", [job.id]);
    console.log('Processed workflow', job.workflow_id);
  }
}

setInterval(processNext, 1000);
