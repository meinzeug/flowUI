import test from 'node:test';
import assert from 'assert';
import { WebSocket } from 'ws';
import { once } from 'node:events';
import { startServer } from '../server.js';


test('GET /health returns ok', { concurrency: 1 }, async () => {
  const server = await startServer(0);
  const port = server.address().port;
  const res = await fetch(`http://localhost:${port}/health`);
  const data = await res.json();
  await new Promise((r) => server.close(r));
  assert.strictEqual(res.status, 200);
  assert.deepStrictEqual(data, { status: 'ok' });
});


test('GET /tools/list returns tool catalog', { concurrency: 1 }, async () => {
  const server = await startServer(0);
  const port = server.address().port;
  const res = await fetch(`http://localhost:${port}/tools/list`);
  const data = await res.json();
  await new Promise((r) => server.close(r));
  assert.strictEqual(res.status, 200);
  assert.ok(Array.isArray(data));
  assert.ok(data.length > 0);
});

test('GET /tools/info/:name returns tool details', { concurrency: 1 }, async () => {
  const server = await startServer(0);
  const port = server.address().port;
  const res = await fetch(`http://localhost:${port}/tools/info/swarm_init`);
  const data = await res.json();
  await new Promise((r) => server.close(r));
  assert.strictEqual(res.status, 200);
  assert.strictEqual(data.name, 'swarm_init');
  assert.ok(data.description);
});

test('POST /api/auth/login authenticates user', { concurrency: 1 }, async () => {
  const server = await startServer(0);
  const port = server.address().port;
  const res = await fetch(`http://localhost:${port}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'password' })
  });
  const data = await res.json();
  await new Promise((r) => server.close(r));
  assert.strictEqual(res.status, 200);
  assert.ok(data.token);
});

test('WebSocket JSON-RPC methods work', { concurrency: 1 }, async () => {
  const server = await startServer(0);
  const port = server.address().port;
  const ws = new WebSocket(`ws://localhost:${port}`);
  await once(ws, 'open');

  ws.send(JSON.stringify({ jsonrpc: '2.0', method: 'tools/list', params: {}, id: 1 }));
  const [listMsg] = await once(ws, 'message');
  const listData = JSON.parse(listMsg);
  assert.ok(Array.isArray(listData.result));

  ws.send(JSON.stringify({ jsonrpc: '2.0', method: 'tools/call', params: { tool: 'swarm_init' }, id: 2 }));
  const [callMsg] = await once(ws, 'message');
  const callData = JSON.parse(callMsg);
  assert.strictEqual(callData.result.tool, 'swarm_init');

  ws.send(JSON.stringify({ jsonrpc: '2.0', method: 'tools/batch', params: { calls: [{ tool: 'swarm_init' }, { tool: 'agent_spawn' }] }, id: 3 }));
  const [batchMsg] = await once(ws, 'message');
  const batchData = JSON.parse(batchMsg);
  assert.strictEqual(batchData.result.length, 2);

  ws.close();
  await new Promise((r) => server.close(r));

});

test('session save and load persist data', { concurrency: 1 }, async () => {
  const server = await startServer(0);
  const port = server.address().port;
  const graph = { nodes: [{ id: '1' }], edges: [] };
  const saveRes = await fetch(`http://localhost:${port}/session/save`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'test', data: graph })
  });
  const saved = await saveRes.json();
  assert.ok(saved.id);

  const loadRes = await fetch(`http://localhost:${port}/session/load`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: saved.id })
  });
  const loaded = await loadRes.json();
  await new Promise((r) => server.close(r));
  assert.deepStrictEqual(loaded.data, graph);
});

test('memory store and query', { concurrency: 1 }, async () => {
  const server = await startServer(0);
  const port = server.address().port;
  const storeRes = await fetch(`http://localhost:${port}/memory/store`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ namespace: 'test', query: 'hello', summary: 'world' })
  });
  const stored = await storeRes.json();
  assert.ok(stored.id);

  const queryRes = await fetch(`http://localhost:${port}/memory/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ namespace: 'test', query: 'hello' })
  });
  const results = await queryRes.json();
  await new Promise((r) => server.close(r));
  assert.ok(results.some((r) => r.id === stored.id));
});

test('GET /session/list returns saved sessions', { concurrency: 1 }, async () => {
  const server = await startServer(0);
  const port = server.address().port;
  const graph = { nodes: [{ id: '1' }], edges: [] };
  const saveRes = await fetch(`http://localhost:${port}/session/save`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'list-test', data: graph })
  });
  const saved = await saveRes.json();
  const listRes = await fetch(`http://localhost:${port}/session/list`);
  const list = await listRes.json();
  await new Promise(r => server.close(r));
  assert.ok(list.some((s) => s.id === saved.id));
});

test('POST /tools/call logs execution', { concurrency: 1 }, async () => {
  const server = await startServer(0);
  const port = server.address().port;
  const res = await fetch(`http://localhost:${port}/tools/call`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tool: 'swarm_init' })
  });
  const data = await res.json();
  await new Promise(r => server.close(r));
  assert.strictEqual(data.tool, 'swarm_init');
  assert.strictEqual(data.status, 'executed');
});
