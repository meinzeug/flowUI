import knexModule from 'knex';
import config from '../../knexfile.cjs';
import { v4 as uuidv4 } from 'uuid';

const knex = typeof (knexModule as any).default === 'function'
  ? (knexModule as any).default
  : (knexModule as any);

const db = knex({
  ...config,
  connection: process.env.DATABASE_URL || (config as any).connection
});

export interface WorkflowStep {
  id: string;
  name: string;
  command: string;
}

export interface Workflow {
  id: string;
  user_id: number;
  name: string;
  description: string;
  steps: WorkflowStep[];
  lastRun: string | null;
}

const queue: string[] = [];

export async function list(userId: number): Promise<Workflow[]> {
  return db('workflows').where({ user_id: userId }).orderBy('created_at', 'desc');
}

export async function get(id: string): Promise<Workflow | undefined> {
  return db('workflows').where({ id }).first();
}

export async function create(userId: number, data: Omit<Workflow, 'id' | 'user_id' | 'lastRun'>): Promise<Workflow> {
  const workflow: Workflow = { ...data, id: uuidv4(), user_id: userId, lastRun: null };
  const [created] = await db('workflows').insert({ ...workflow, steps: JSON.stringify(workflow.steps) }).returning('*');
  return { ...created, steps: JSON.parse(created.steps) } as Workflow;
}

export async function update(id: string, data: Partial<Omit<Workflow, 'id' | 'user_id' | 'lastRun'>>): Promise<Workflow | undefined> {
  const [wf] = await db('workflows').where({ id }).update({ ...data, steps: data.steps ? JSON.stringify(data.steps) : undefined }).returning('*');
  return wf ? { ...wf, steps: JSON.parse(wf.steps) } as Workflow : undefined;
}

export async function remove(id: string): Promise<boolean> {
  const count = await db('workflows').where({ id }).del();
  return count > 0;
}

export function enqueue(id: string): boolean {
  queue.push(id);
  return true;
}

export function dequeue(): string | undefined {
  return queue.shift();
}

export async function markRun(id: string): Promise<void> {
  await db('workflows').where({ id }).update({ last_run: db.fn.now() });
}

export default { list, get, create, update, remove, enqueue, dequeue, markRun };
