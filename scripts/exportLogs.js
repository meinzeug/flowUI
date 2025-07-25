#!/usr/bin/env node
const fs = require('fs');
const { initDb, getPool } = require('../db');

async function run() {
  const [, , outfile] = process.argv;
  await initDb();
  const pool = getPool();
  const { rows } = await pool.query('SELECT * FROM activity_log ORDER BY id');
  const json = JSON.stringify(rows, null, 2);
  if (outfile) {
    fs.writeFileSync(outfile, json);
    console.log(`wrote ${rows.length} logs to ${outfile}`);
  } else {
    console.log(json);
  }
  await pool.query('DELETE FROM activity_log');
  console.log('logs cleared');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
