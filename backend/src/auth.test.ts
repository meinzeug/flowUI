import assert from 'assert';
import { once } from 'events';
import { test } from 'node:test';
import app from './index.js';
import db from './db.js';
import userService from './services/userService.js';

async function startServer() {
  await db.migrate.latest();
  const server = app.listen(0);
  await once(server, 'listening');
  return server;
}

test('registration hashes password and login via email works', async () => {
  const server = await startServer();
  const port = (server.address() as any).port;

  const regRes = await fetch(`http://localhost:${port}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'a1', email: 'a1@test.com', password: 'p' })
  });
  assert.strictEqual(regRes.status, 200);
  const regData = await regRes.json();
  assert.ok(regData.token);

  const user = await userService.findByUsername('a1');
  assert(user);
  assert.notStrictEqual(user!.password_hash, 'p');

  const loginRes = await fetch(`http://localhost:${port}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'a1@test.com', password: 'p' })
  });
  assert.strictEqual(loginRes.status, 200);
  const loginData = await loginRes.json();
  assert.ok(loginData.token);

  server.close();
  await once(server, 'close');
  await db.destroy();
});
