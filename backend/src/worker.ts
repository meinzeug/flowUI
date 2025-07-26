import WebSocket from 'ws';
import dotenv from 'dotenv';
import workflowService, { QueueItem } from './services/workflowService.js';
import { broadcast } from './ws.js';

dotenv.config();

const MCP_URL = process.env.MCP_WS_URL || 'ws://mcp:3008';
const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';

let current: { item: QueueItem; ws: WebSocket } | null = null;

async function executeWorkflow(item: QueueItem) {
  const id = item.workflow_id;
  const wf = await workflowService.get(id);
  if (!wf) return;
  const ws = new WebSocket(MCP_URL);
  current = { item, ws };
  await new Promise((resolve, reject) => {
    ws.once('open', resolve);
    ws.once('error', reject);
  });
  ws.send(JSON.stringify({ token: JWT_SECRET }));
  await new Promise((resolve) => setTimeout(resolve, 100));
  const args = wf.steps.map(s => s.command);
  ws.send(JSON.stringify({ event: 'tools/batch', args }));
  broadcast('workflow', 'workflowProgress', { id, queueId: item.id, status: 'running', progress: 0 });
  await new Promise<void>((resolve) => {
    ws.on('message', async (data) => {
      let msg: any;
      try { msg = JSON.parse(data.toString()); } catch { return; }
      if (msg.event === 'batchResult') {
        const lines = String(msg.result).split(/\r?\n/);
        for (const line of lines) {
          if (line.trim()) {
            await workflowService.addLog(item.id, line);
            broadcast('workflow', 'workflowLog', { queueId: item.id, message: line });
          }
        }
        await workflowService.markRun(id);
        await workflowService.markFinished(item.id);
        broadcast('workflow', 'workflowProgress', { id, queueId: item.id, status: 'finished', progress: 100 });
        ws.close();
        resolve();
      }
    });
    ws.once('close', () => resolve());
  });
  current = null;
}

export async function cancelJob(id: number) {
  if (current && current.item.id === id) {
    current.ws.close();
    await workflowService.markCancelled(id);
    broadcast('workflow', 'workflowProgress', { id: current.item.workflow_id, queueId: id, status: 'cancelled', progress: current.item.progress });
    current = null;
  } else {
    await workflowService.markCancelled(id);
  }
}

export function startWorker() {
  setInterval(async () => {
    const item = await workflowService.dequeue();
    if (item) {
      try {
        await executeWorkflow(item);
      } catch (err) {
        console.error('Workflow execution failed', err);
      }
    }
  }, 1000);
}
