import { v4 as uuidv4 } from 'uuid';

export interface WorkflowStep {
  id: string;
  name: string;
  command: string;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  lastRun: string | null;
}

const workflows = new Map<string, Workflow>();
const queue: string[] = [];

export function list(): Workflow[] {
  return Array.from(workflows.values());
}

export function get(id: string): Workflow | undefined {
  return workflows.get(id);
}

export function create(data: Omit<Workflow, 'id' | 'lastRun'>): Workflow {
  const workflow: Workflow = { ...data, id: uuidv4(), lastRun: null };
  workflows.set(workflow.id, workflow);
  return workflow;
}

export function update(id: string, data: Partial<Omit<Workflow, 'id' | 'lastRun'>>): Workflow | undefined {
  const wf = workflows.get(id);
  if (!wf) return undefined;
  Object.assign(wf, data);
  workflows.set(id, wf);
  return wf;
}

export function remove(id: string): boolean {
  return workflows.delete(id);
}

export function enqueue(id: string): boolean {
  if (!workflows.has(id)) return false;
  queue.push(id);
  return true;
}

export function dequeue(): string | undefined {
  return queue.shift();
}

export function markRun(id: string): void {
  const wf = workflows.get(id);
  if (wf) {
    wf.lastRun = new Date().toISOString();
  }
}

export default { list, get, create, update, remove, enqueue, dequeue, markRun };
