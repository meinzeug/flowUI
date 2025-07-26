import knexModule from 'knex';
import config from '../../knexfile.cjs';

const knex = typeof (knexModule as any).default === 'function'
  ? (knexModule as any).default
  : (knexModule as any);

const db = knex({
  ...config,
  connection: process.env.DATABASE_URL || (config as any).connection
});

export interface Project {
  id: number;
  user_id: number;
  name: string;
  description: string | null;
  created_at: string;
}

export async function create(userId: number, data: { name: string; description?: string }): Promise<Project> {
  const [p] = await db('projects')
    .insert({ user_id: userId, name: data.name, description: data.description })
    .returning('*');
  return p as Project;
}

export async function list(userId: number): Promise<Project[]> {
  return db('projects').where({ user_id: userId }).orderBy('created_at', 'desc');
}

export async function get(userId: number, id: number): Promise<Project | undefined> {
  return db('projects').where({ id, user_id: userId }).first();
}

export default { create, list, get };
