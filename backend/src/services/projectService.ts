import db from '../db.js';

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

export async function update(userId: number, id: number, data: { name?: string; description?: string }): Promise<Project | undefined> {
  const [p] = await db('projects')
    .where({ id, user_id: userId })
    .update(data)
    .returning('*');
  return p as Project | undefined;
}

export async function remove(userId: number, id: number): Promise<boolean> {
  const count = await db('projects').where({ id, user_id: userId }).del();
  return count > 0;
}

export default { create, list, get, update, remove };
