import assert from 'assert';
import { once } from 'events';
import { test } from 'node:test';
import app from './index.js';
import db from './db.js';
import { initWs } from './ws.js';
import { startWorker } from './worker.js';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer } from 'http';

async function startServer() {
  await db.migrate.latest();
  const httpServer = createServer(app);
  initWs(httpServer);
  startWorker();
  httpServer.listen(0);
  await once(httpServer, 'listening');
  return httpServer;
}

async function register(port:number) {
  const res = await fetch(`http://localhost:${port}/auth/register`, {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ username:'w1', email:'w1@test.com', password:'p' })
  });
  const data = await res.json();
  return data.token;
}

test('workflow CRUD', async () => {
  const server = await startServer();
  const port = (server.address() as any).port;
  const token = await register(port);

  const create = await fetch(`http://localhost:${port}/workflows`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ name: 'wf', description: '', steps: [] })
  });
  assert.strictEqual(create.status, 201);
  const created = await create.json();

  const listRes = await fetch(`http://localhost:${port}/workflows`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const list = await listRes.json();
  assert.ok(list.length === 1);

  const updateRes = await fetch(`http://localhost:${port}/workflows/${created.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ name: 'wf2' })
  });
  const updated = await updateRes.json();
  assert.strictEqual(updated.name, 'wf2');

  const delRes = await fetch(`http://localhost:${port}/workflows/${created.id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  const delBody = await delRes.json();
  assert.ok(delBody.deleted);

  server.close();
  await once(server, 'close');
  await db.destroy();
});

test('workflow execute queue and ws', async () => {
  const mcp = new WebSocketServer({ port: 0 });
  const mcpPort = (mcp.address() as any).port;
  mcp.on('connection', ws => {
    ws.on('message', msg => {
      const data = JSON.parse(msg.toString());
      if (data.event === 'tools/batch') {
        ws.send('done');
      }
    });
  });
  process.env.MCP_WS_URL = `ws://localhost:${mcpPort}`;

  const server = await startServer();
  const port = (server.address() as any).port;
  const token = await register(port);

  const create = await fetch(`http://localhost:${port}/workflows`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ name: 'wf', description: '', steps: [{ id: 's', name: 'cmd', command: 'echo' }] })
  });
  const wf = await create.json();

  const ws = new WebSocket(`ws://localhost:${port}/ws?token=${token}`);
  await once(ws, 'open');
  ws.send(JSON.stringify({ event: 'subscribe', channel: 'workflow' }));
  await once(ws, 'message');

  await fetch(`http://localhost:${port}/workflows/${wf.id}/execute`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }
  });

  const qres = await fetch(`http://localhost:${port}/workflows/queue`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const queue = await qres.json();
  assert.ok(queue.length === 1);
  assert.strictEqual(queue[0].status, 'queued');

  const msg: any = JSON.parse((await once(ws, 'message'))[0].toString());
  assert.strictEqual(msg.event, 'workflowProgress');

  ws.close();
  await once(ws, 'close');
  server.close();
  await once(server, 'close');
  mcp.close();
  await db.destroy();
});
