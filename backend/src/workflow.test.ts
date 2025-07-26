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

test('create workflow with empty body returns 400', async () => {
  const server = await startServer();
  const port = (server.address() as any).port;
  const token = await register(port);

  const res = await fetch(`http://localhost:${port}/workflows`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: ''
  });

  assert.strictEqual(res.status, 400);
  const body = await res.json();
  assert.strictEqual(body.error, 'invalid_json');

  server.close();
  await once(server, 'close');
  await db.destroy();
});

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

test('cancel running workflow', async () => {
  const mcp = new WebSocketServer({ port: 0 });
  const mcpPort = (mcp.address() as any).port;
  mcp.on('connection', ws => {
    ws.on('message', msg => {
      const data = JSON.parse(msg.toString());
      if (data.event === 'tools/batch') {
        setTimeout(() => ws.close(), 50);
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
  const queueId = queue[0].id;

  await fetch(`http://localhost:${port}/workflows/queue/${queueId}/cancel`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }
  });

  const qres2 = await fetch(`http://localhost:${port}/workflows/queue`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const queue2 = await qres2.json();
  assert.strictEqual(queue2[0].status, 'cancelled');

  ws.close();
  await once(ws, 'close');
  server.close();
  await once(server, 'close');
  mcp.close();
  await db.destroy();
});

test('queue item detail endpoint', async () => {
  const server = await startServer();
  const port = (server.address() as any).port;
  const token = await register(port);

  const create = await fetch(`http://localhost:${port}/workflows`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ name: 'wf', description: '', steps: [] })
  });
  const wf = await create.json();

  await fetch(`http://localhost:${port}/workflows/${wf.id}/execute`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }
  });

  const qres = await fetch(`http://localhost:${port}/workflows/queue`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const queue = await qres.json();
  const queueId = queue[0].id;

  const detailRes = await fetch(`http://localhost:${port}/workflows/queue/${queueId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  assert.strictEqual(detailRes.status, 200);
  const detail = await detailRes.json();
  assert.strictEqual(detail.id, queueId);
  assert.strictEqual(detail.workflow_id, wf.id);

  server.close();
  await once(server, 'close');
  await db.destroy();
});

test('queue logs endpoint', async () => {
  const mcp = new WebSocketServer({ port: 0 });
  const mcpPort = (mcp.address() as any).port;
  mcp.on('connection', ws => {
    ws.on('message', msg => {
      const data = JSON.parse(msg.toString());
      if (data.event === 'tools/batch') {
        ws.send(JSON.stringify({ event: 'batchResult', result: 'hello\nworld' }));
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

  const done = new Promise(resolve => {
    ws.on('message', data => {
      const msg = JSON.parse(data.toString());
      if (msg.event === 'workflowProgress' && msg.payload.status === 'finished') resolve(null);
    });
  });

  await fetch(`http://localhost:${port}/workflows/${wf.id}/execute`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }
  });

  await done;

  const qres = await fetch(`http://localhost:${port}/workflows/queue`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const queue = await qres.json();
  const queueId = queue[0].id;

  const logsRes = await fetch(`http://localhost:${port}/workflows/queue/${queueId}/logs`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const logs = await logsRes.json();
  assert.strictEqual(logs.length, 2);
  assert.strictEqual(logs[0].message, 'hello');

  ws.close();
  await once(ws, 'close');
  server.close();
  await once(server, 'close');
  mcp.close();
  await db.destroy();
});
