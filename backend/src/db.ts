import knexModule from 'knex';
import config from '../knexfile.cjs';

const knex = typeof (knexModule as any).default === 'function'
  ? (knexModule as any).default
  : (knexModule as any);

const db = knex({
  ...config,
  connection: process.env.DATABASE_URL || (config as any).connection
});

export function close() {
  return db.destroy();
}

export function migrate() {
  return db.migrate.latest();
}

export default db;
