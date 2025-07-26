import assert from 'assert';
import { once } from 'events';
import { test } from 'node:test';
import app from './index.js';
import db from './db.js';

async function startServer() {
  const server = app.listen(0);
  await once(server, 'listening');
  return server;
}

async function registerAndLogin(port: number) {
  const res = await fetch(`http://localhost:${port}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'u1', email: 'u1@test.com', password: 'p' })
  });
  const data = await res.json();
  return data.token;
}

test('GET /profile returns user data', async () => {
  const server = await startServer();
  const port = (server.address() as any).port;
  const token = await registerAndLogin(port);
  const res = await fetch(`http://localhost:${port}/profile`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const body = await res.json();
  server.close();
  await once(server, 'close');
  assert.strictEqual(body.user.username, 'u1');
  await db.destroy();
});
