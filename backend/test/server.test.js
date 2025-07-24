import test from 'node:test';
import assert from 'assert';
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

test('session save and load', async () => {
  const server = await startServer(0);
  const port = server.address().port;
  const saveRes = await fetch(`http://localhost:${port}/session/save`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'test', data: { nodes: [], edges: [] } })
  });
  const { id } = await saveRes.json();
  const loadRes = await fetch(`http://localhost:${port}/session/load`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id })
  });
  const loaded = await loadRes.json();
  server.close();
  assert.strictEqual(saveRes.status, 200);
  assert.strictEqual(loadRes.status, 200);
  assert.strictEqual(loaded.id, id);
  assert.deepStrictEqual(loaded.data, { nodes: [], edges: [] });
});
