import WebSocket from 'ws';
import dotenv from 'dotenv';
import workflowService, { QueueItem } from './services/workflowService.js';
import { broadcast } from './ws.js';

dotenv.config();

const MCP_URL = process.env.MCP_WS_URL || 'ws://mcp:3008';
const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';

async function executeWorkflow(item: QueueItem) {
  const id = item.workflow_id;
  const wf = await workflowService.get(id);
  if (!wf) return;
  const ws = new WebSocket(MCP_URL);
  await new Promise((resolve, reject) => {
    ws.once('open', resolve);
    ws.once('error', reject);
  });
  ws.send(JSON.stringify({ token: JWT_SECRET }));
  await new Promise((resolve) => setTimeout(resolve, 100));
  const args = wf.steps.map(s => s.command);
  ws.send(JSON.stringify({ event: 'tools/batch', args }));
  broadcast('workflow', 'workflowProgress', { id, queueId: item.id, status: 'running', progress: 0 });
  ws.once('message', () => {
    workflowService.markRun(id);
    workflowService.markFinished(item.id);
    broadcast('workflow', 'workflowProgress', { id, queueId: item.id, status: 'finished', progress: 100 });
    ws.close();
  });
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
