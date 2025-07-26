import assert from 'assert';
import { once } from 'events';
import { test } from 'node:test';
import app from './index.js';

async function startServer() {
  const server = app.listen(0);
  await once(server, 'listening');
  return server;
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
  process.exit(0);
});
