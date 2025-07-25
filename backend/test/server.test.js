import test from 'node:test';
import assert from 'assert';
import { WebSocket } from 'ws';
import { once } from 'node:events';

process.env.JWT_SECRET = 'testsecret';

async function startServerWrapper() {
  const { startServer } = await import('../server.js');
  return startServer(0);
}

test('server fails to start without JWT_SECRET', { concurrency: 1 }, async () => {
  const original = process.env.JWT_SECRET;
  delete process.env.JWT_SECRET;
  await assert.rejects(() => import('../server.js?' + Date.now()), /JWT_SECRET/);
  if (original !== undefined) process.env.JWT_SECRET = original;
});


test('GET /health returns ok', { concurrency: 1 }, async () => {
  const server = await startServerWrapper();
  const port = server.address().port;
  const res = await fetch(`http://localhost:${port}/health`);
  const data = await res.json();
  await new Promise((r) => server.close(r));
  assert.strictEqual(res.status, 200);
  assert.deepStrictEqual(data, { status: 'ok' });
});


test('GET /tools/list returns tool catalog', { concurrency: 1 }, async () => {
  const server = await startServerWrapper();
  const port = server.address().port;
  const res = await fetch(`http://localhost:${port}/tools/list`);
  const data = await res.json();
  await new Promise((r) => server.close(r));
  assert.strictEqual(res.status, 200);
  assert.ok(Array.isArray(data));
  assert.ok(data.length > 0);
});

test('GET /tools/info/:name returns tool details', { concurrency: 1 }, async () => {
  const server = await startServerWrapper();
  const port = server.address().port;
  const res = await fetch(`http://localhost:${port}/tools/info/swarm_init`);
  const data = await res.json();
  await new Promise((r) => server.close(r));
  assert.strictEqual(res.status, 200);
  assert.strictEqual(data.name, 'swarm_init');
  assert.ok(data.description);
});

test('POST /api/auth/register creates user', { concurrency: 1 }, async () => {
  const server = await startServerWrapper();
  const port = server.address().port;
  const res = await fetch(`http://localhost:${port}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'alice', email: 'a@example.com', password: 'secret' })
  });
  const data = await res.json();
  await new Promise((r) => server.close(r));
  assert.strictEqual(res.status, 200);
  assert.strictEqual(data.status, 'ok');
});

test('POST /api/auth/login authenticates user', { concurrency: 1 }, async () => {
  const server = await startServerWrapper();
  const port = server.address().port;
  await fetch(`http://localhost:${port}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'bob', email: 'b@example.com', password: 'pass' })
  });
  const res = await fetch(`http://localhost:${port}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'bob', password: 'pass' })
  });
  const data = await res.json();
  await new Promise((r) => server.close(r));
  assert.strictEqual(res.status, 200);
  assert.ok(data.token);
});

test('POST /api/auth/login rejects invalid credentials', { concurrency: 1 }, async () => {
  const server = await startServerWrapper();
  const port = server.address().port;
  await fetch(`http://localhost:${port}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'charlie', email: 'c@example.com', password: 'good' })
  });
  const res = await fetch(`http://localhost:${port}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'charlie', password: 'bad' })
  });
  await new Promise((r) => server.close(r));
  assert.strictEqual(res.status, 401);
});

test('WebSocket JSON-RPC methods work', { concurrency: 1 }, async () => {
  const server = await startServerWrapper();
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
  const server = await startServerWrapper();
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
  const server = await startServerWrapper();
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
  const server = await startServerWrapper();
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

test('session export and import', { concurrency: 1 }, async () => {
  const server = await startServerWrapper();
  const port = server.address().port;
  const graph = { nodes: [{ id: '1' }], edges: [] };
  const saveRes = await fetch(`http://localhost:${port}/session/save`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'export-test', data: graph })
  });
  const saved = await saveRes.json();

  const exportRes = await fetch(`http://localhost:${port}/session/export/${saved.id}`);
  const exported = await exportRes.json();
  assert.strictEqual(exportRes.status, 200);
  assert.deepStrictEqual(exported.data, graph);

  const importRes = await fetch(`http://localhost:${port}/session/import`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'imported', data: exported.data })
  });
  const imported = await importRes.json();
  const loadRes = await fetch(`http://localhost:${port}/session/load`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: imported.id })
  });
  const loaded = await loadRes.json();
  await new Promise(r => server.close(r));
  assert.deepStrictEqual(loaded.data, graph);
});

test('POST /tools/call logs execution', { concurrency: 1 }, async () => {
  const server = await startServerWrapper();
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

test('POST /tools/batch executes multiple tools', { concurrency: 1 }, async () => {
  const server = await startServerWrapper();
  const port = server.address().port;
  const res = await fetch(`http://localhost:${port}/tools/batch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ calls: [{ tool: 'swarm_init' }, { tool: 'agent_spawn' }] })
  });
  const data = await res.json();
  await new Promise(r => server.close(r));
  assert.strictEqual(Array.isArray(data), true);
  assert.strictEqual(data.length, 2);
});

test('GET /metrics/training returns metrics', { concurrency: 1 }, async () => {
  const server = await startServerWrapper();
  const port = server.address().port;
  const res = await fetch(`http://localhost:${port}/metrics/training`);
  const data = await res.json();
  await new Promise(r => server.close(r));
  assert.strictEqual(res.status, 200);
  assert.ok(Array.isArray(data));
  assert.ok(data.length > 0);
});
