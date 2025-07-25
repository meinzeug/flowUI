const { Pool } = require('pg');
const { DATABASE_URL } = require('./config/config');

let pool;

async function initDb() {
  if (pool) return pool;
  if (process.env.NODE_ENV === 'test') {
    const { newDb } = require('pg-mem');
    const db = newDb();
    const adapter = db.adapters.createPg();
    pool = new adapter.Pool();
    await pool.query(`CREATE TABLE users (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT now()
    )`);
    await pool.query(`CREATE TABLE activity_log (
      id SERIAL PRIMARY KEY,
      timestamp TIMESTAMP DEFAULT now(),
      type TEXT NOT NULL,
      message TEXT NOT NULL
    )`);
  } else {
    pool = new Pool({ connectionString: DATABASE_URL });
    await pool.query(`CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT now()
    )`);
    await pool.query(`CREATE TABLE IF NOT EXISTS activity_log (
      id SERIAL PRIMARY KEY,
      timestamp TIMESTAMP DEFAULT now(),
      type TEXT NOT NULL,
      message TEXT NOT NULL
    )`);
  }
  return pool;
}

function getPool() {
  if (!pool) throw new Error('Database not initialized');
  return pool;
}

module.exports = { initDb, getPool };
