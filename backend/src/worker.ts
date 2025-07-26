import WebSocket from 'ws';
import dotenv from 'dotenv';
import workflowService from './services/workflowService.js';

dotenv.config();

const MCP_URL = process.env.MCP_WS_URL || 'ws://mcp:3008';
const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';

async function executeWorkflow(id: string) {
  const wf = workflowService.get(id);
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
  ws.once('message', () => {
    workflowService.markRun(id);
    ws.close();
  });
}

export function startWorker() {
  setInterval(async () => {
    const id = workflowService.dequeue();
    if (id) {
      try {
        await executeWorkflow(id);
      } catch (err) {
        console.error('Workflow execution failed', err);
      }
    }
  }, 1000);
}
