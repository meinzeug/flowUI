import db from '../db.js';
import { v4 as uuidv4 } from 'uuid';

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

export interface QueueItem {
  id: number;
  workflow_id: string;
  status: string;
  progress: number;
  created_at: string;
}

export interface QueueItemWithWorkflow extends QueueItem {
  name: string;
}

export interface QueueItemDetail extends QueueItemWithWorkflow {
  user_id: number;
}

export async function getQueueItem(id: number): Promise<QueueItem | undefined> {
  return db('workflow_queue').where({ id }).first();
}

export async function getQueueItemDetail(id: number): Promise<QueueItemDetail | undefined> {
  return db('workflow_queue')
    .join('workflows', 'workflow_queue.workflow_id', 'workflows.id')
    .where('workflow_queue.id', id)
    .select(
      'workflow_queue.id',
      'workflow_queue.workflow_id',
      'workflow_queue.status',
      'workflow_queue.progress',
      'workflow_queue.created_at',
      'workflows.name',
      'workflows.user_id'
    )
    .first();
}

export async function markCancelled(id: number): Promise<void> {
  await db('workflow_queue').where({ id }).update({ status: 'cancelled' });
}

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

export async function enqueue(id: string): Promise<QueueItem> {
  const [item] = await db('workflow_queue')
    .insert({ workflow_id: id })
    .returning('*');
  return item as QueueItem;
}

export async function dequeue(): Promise<QueueItem | undefined> {
  const item = await db('workflow_queue')
    .where({ status: 'queued' })
    .orderBy('created_at')
    .first();
  if (item) {
    await db('workflow_queue').where({ id: item.id }).update({ status: 'running' });
    return item as QueueItem;
  }
  return undefined;
}

export async function markProgress(id: number, progress: number): Promise<void> {
  await db('workflow_queue').where({ id }).update({ progress });
}

export async function markFinished(id: number): Promise<void> {
  await db('workflow_queue').where({ id }).update({ status: 'finished', progress: 100 });
}

export async function markRun(id: string): Promise<void> {
  await db('workflows').where({ id }).update({ last_run: db.fn.now() });
}

export async function listQueue(userId: number): Promise<QueueItemWithWorkflow[]> {
  return db('workflow_queue')
    .join('workflows', 'workflow_queue.workflow_id', 'workflows.id')
    .where('workflows.user_id', userId)
    .orderBy('workflow_queue.created_at')
    .select(
      'workflow_queue.id',
      'workflow_queue.workflow_id',
      'workflow_queue.status',
      'workflow_queue.progress',
      'workflow_queue.created_at',
      'workflows.name'
    );
}

export default {
  list,
  get,
  create,
  update,
  remove,
  enqueue,
  dequeue,
  markProgress,
  markFinished,
  markRun,
  listQueue,
  getQueueItem,
  getQueueItemDetail,
  markCancelled
};
