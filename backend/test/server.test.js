import test from 'node:test';
import assert from 'assert';
import { WebSocket } from 'ws';
import { once } from 'node:events';
import { startServer } from '../server.js';


test('GET /health returns ok', async () => {
  const server = await startServer(0);
  const port = server.address().port;
  const res = await fetch(`http://localhost:${port}/health`);
  const data = await res.json();
  server.close();
  assert.strictEqual(res.status, 200);
  assert.deepStrictEqual(data, { status: 'ok' });
});


test('GET /tools/list returns tool catalog', async () => {
  const server = await startServer(0);
  const port = server.address().port;
  const res = await fetch(`http://localhost:${port}/tools/list`);
  const data = await res.json();
  server.close();
  assert.strictEqual(res.status, 200);
  assert.ok(Array.isArray(data));
  assert.ok(data.length > 0);
});

test('WebSocket JSON-RPC methods work', async () => {
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
  server.close();

});

test('session save and load persist data', async () => {
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
  server.close();
  assert.deepStrictEqual(loaded.data, graph);
});
