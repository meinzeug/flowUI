import assert from 'assert';
import { once } from 'events';
import { test } from 'node:test';
import app from './index.js';
import db from './db.js';

async function startServer() {
  await db.migrate.latest();
  const server = app.listen(0);
  await once(server, 'listening');
  return server;
}

async function register(port:number) {
  const res = await fetch(`http://localhost:${port}/auth/register`, {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ username:'p1', email:'p1@test.com', password:'p' })
  });
  const data = await res.json();
  return data.token;
}

test('project CRUD', async () => {
  const server = await startServer();
  const port = (server.address() as any).port;
  const token = await register(port);

  const create = await fetch(`http://localhost:${port}/projects`, {
    method:'POST',
    headers:{'Content-Type':'application/json', Authorization:`Bearer ${token}`},
    body: JSON.stringify({ name:'proj', description:'d' })
  });
  const project = await create.json();
  assert.strictEqual(create.status,201);

  const update = await fetch(`http://localhost:${port}/projects/${project.id}`, {
    method:'PUT',
    headers:{'Content-Type':'application/json', Authorization:`Bearer ${token}`},
    body: JSON.stringify({ name:'new' })
  });
  const upd = await update.json();
  assert.strictEqual(upd.name,'new');

  const del = await fetch(`http://localhost:${port}/projects/${project.id}`, {
    method:'DELETE',
    headers:{ Authorization:`Bearer ${token}` }
  });
  const delBody = await del.json();
  assert.ok(delBody.deleted);

  server.close();
  await once(server,'close');
  await db.destroy();
});
