import knexModule from 'knex';
import config from '../../knexfile.cjs';
import { User } from '../models/User.js';

const knex = typeof (knexModule as any).default === 'function'
  ? (knexModule as any).default
  : (knexModule as any);

const db = knex({
  ...config,
  connection: process.env.DATABASE_URL || (config as any).connection
});

export async function create(user: User): Promise<User> {
  const [created] = await db('users').insert(user).returning(['id','username','email','password_hash']);
  return created as User;
}

export async function findByUsername(username: string): Promise<User | undefined> {
  return db('users').where({ username }).first();
}

export async function findById(id: number): Promise<User | undefined> {
  return db('users').where({ id }).first();
}

export default { create, findByUsername, findById };
