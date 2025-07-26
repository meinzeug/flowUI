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

export interface WorkflowLog {
  id: number;
  queue_id: number;
  message: string;
  created_at: string;
}

// Utility to safely parse JSON steps
function parseSteps(raw: string | null | undefined): WorkflowStep[] {
  if (!raw || raw.trim() === '') return [];
  try {
    return JSON.parse(raw);
  } catch {
    console.warn('Failed to parse steps JSON, returning empty array');
    return [];
  }
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
  const items = await db('workflows').where({ user_id: userId }).orderBy('created_at', 'desc');
  return items.map((i: any) => ({
    ...i,
    lastRun: i.last_run,
    steps: parseSteps(i.steps),
  }));
}

export async function get(id: string): Promise<Workflow | undefined> {
  const wf = await db('workflows').where({ id }).first();
  return wf
    ? ({
        ...wf,
        lastRun: wf.last_run,
        steps: parseSteps(wf.steps),
      } as Workflow)
    : undefined;
}

export async function create(
  userId: number,
  data: Omit<Workflow, 'id' | 'user_id' | 'lastRun'>
): Promise<Workflow> {
  const workflow: Workflow = {
    ...data,
    steps: data.steps ?? [],
    id: uuidv4(),
    user_id: userId,
    lastRun: null,
  };
  const insertData: any = {
    ...workflow,
    last_run: workflow.lastRun,
    steps: JSON.stringify(workflow.steps),
  };
  delete insertData.lastRun;
  const [created] = await db('workflows').insert(insertData).returning('*');
  return {
    ...created,
    lastRun: created.last_run,
    steps: parseSteps(created.steps),
  } as Workflow;
}

export async function update(
  id: string,
  data: Partial<Omit<Workflow, 'id' | 'user_id' | 'lastRun'>>
): Promise<Workflow | undefined> {
  const updateFields: any = {};
  if (data.name !== undefined) updateFields.name = data.name;
  if (data.description !== undefined) updateFields.description = data.description;
  if (data.steps !== undefined) updateFields.steps = JSON.stringify(data.steps);

  const [wf] = await db('workflows').where({ id }).update(updateFields).returning('*');
  return wf
    ? ({
        ...wf,
        lastRun: wf.last_run,
        steps: parseSteps(wf.steps),
      } as Workflow)
    : undefined;
}

export async function remove(id: string): Promise<boolean> {
  const count = await db('workflows').where({ id }).del();
  return count > 0;
}

export async function enqueue(id: string): Promise<QueueItem> {
  const [item] = await db('workflow_queue').insert({ workflow_id: id }).returning('*');
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

export async function addLog(queueId: number, message: string): Promise<void> {
  await db('workflow_logs').insert({ queue_id: queueId, message });
}

export async function getLogs(queueId: number): Promise<WorkflowLog[]> {
  return db('workflow_logs')
    .where({ queue_id: queueId })
    .orderBy('id')
    .select('id', 'queue_id', 'message', 'created_at');
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
  markCancelled,
  addLog,
  getLogs,
};
