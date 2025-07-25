const { test } = require('node:test');
const assert = require('assert');
const fetch = global.fetch;
const { startServer } = require('../server');
const { WebSocket } = require('ws');

process.env.JWT_SECRET = 'testsecret';
process.env.NODE_ENV = 'test';

async function start() {
  return startServer(0);
}

test('register and login flow', async () => {
  const server = await start();
  const port = server.address().port;

  const regRes = await fetch(`http://localhost:${port}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'alice', email: 'a@b.com', password: 'p' })
  });
  assert.strictEqual(regRes.status, 200);
  const regData = await regRes.json();
  assert.ok(regData.token);

  const logRes = await fetch(`http://localhost:${port}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'alice', password: 'p' })
  });
  const logData = await logRes.json();
  assert.strictEqual(logRes.status, 200);
  assert.ok(logData.token);

  await new Promise(r => server.close(r));
});

test('protected route requires auth', async () => {
  const server = await start();
  const port = server.address().port;
  const res = await fetch(`http://localhost:${port}/api/test`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ foo: 'bar' })
  });
  assert.strictEqual(res.status, 401);
  await new Promise(r => server.close(r));
});

test('protected route works with token', async () => {
  const server = await start();
  const port = server.address().port;
  const reg = await fetch(`http://localhost:${port}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'bob', email: 'b@b.com', password: 'p' })
  });
  const { token } = await reg.json();

  const res = await fetch(`http://localhost:${port}/api/test`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ foo: 'bar' })
  });
  const data = await res.json();
  assert.strictEqual(res.status, 200);
  assert.strictEqual(data.success, true);

  await new Promise(r => server.close(r));
});

test('profile requires auth', async () => {
  const server = await start();
  const port = server.address().port;
  const res = await fetch(`http://localhost:${port}/api/profile`);
  assert.strictEqual(res.status, 401);
  await new Promise(r => server.close(r));
});

test('profile returns user info with token', async () => {
  const server = await start();
  const port = server.address().port;
  const reg = await fetch(`http://localhost:${port}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'carol', email: 'c@c.com', password: 'p' })
  });
  const { token } = await reg.json();

  const res = await fetch(`http://localhost:${port}/api/profile`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  assert.strictEqual(res.status, 200);
  assert.strictEqual(data.user.username, 'carol');

  await new Promise(r => server.close(r));
});

test('GET /api/status returns ok with user count', async () => {
  const server = await start();
  const port = server.address().port;
  const res = await fetch(`http://localhost:${port}/api/status`);
  const data = await res.json();
  assert.strictEqual(res.status, 200);
  assert.strictEqual(data.status, 'ok');
  assert.ok(typeof data.userCount === 'number' && data.userCount >= 0);
  await new Promise(r => server.close(r));
});

test('GET /api/users returns list of users', async () => {
  const server = await start();
  const port = server.address().port;
  const reg = await fetch(`http://localhost:${port}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'dave', email: 'd@d.com', password: 'p' })
  });
  const { token } = await reg.json();

  const res = await fetch(`http://localhost:${port}/api/users`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  assert.strictEqual(res.status, 200);
  assert.ok(Array.isArray(data) && data.length > 0);
  assert.ok(data[0].username);
  await new Promise(r => server.close(r));
});


test('GET /api/hive/logs returns persisted logs', async () => {
  const server = await start();
  const port = server.address().port;
  const reg = await fetch(`http://localhost:${port}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'frank', email: 'f@f.com', password: 'p' })
  });
  const { token } = await reg.json();
  await fetch(`http://localhost:${port}/api/hive/log`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ message: 'persisted' })
  });

  const res = await fetch(`http://localhost:${port}/api/hive/logs`);
  const logs = await res.json();
  assert.ok(logs.some(l => l.message === 'persisted'));
  await new Promise(r => server.close(r));
});

test('DELETE /api/hive/logs clears logs', async () => {
  const server = await start();
  const port = server.address().port;
  const reg = await fetch(`http://localhost:${port}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'gary', email: 'g@g.com', password: 'p' })
  });
  const { token } = await reg.json();

  await fetch(`http://localhost:${port}/api/hive/log`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ message: 'remove me' })
  });

  const delRes = await fetch(`http://localhost:${port}/api/hive/logs`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  const delData = await delRes.json();
  assert.strictEqual(delRes.status, 200);
  assert.strictEqual(delData.success, true);

  const res = await fetch(`http://localhost:${port}/api/hive/logs`);
  const logs = await res.json();
  assert.strictEqual(logs.length, 0);

  await new Promise(r => server.close(r));
});

test('WebSocket connection works with token', async () => {
  const server = await start();
  const port = server.address().port;

  const reg = await fetch(`http://localhost:${port}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'harry', email: 'h@h.com', password: 'p' })
  });
  const { token } = await reg.json();

  const ws = new WebSocket(`ws://localhost:${port}/ws?token=${token}`);
  await new Promise(res => ws.on('open', res));
  ws.close();
  await new Promise(r => server.close(r));
});

test('WebSocket connection fails on invalid path', async () => {
  const server = await start();
  const port = server.address().port;
  const ws = new WebSocket(`ws://localhost:${port}/bad`);
  await new Promise(res => ws.on('error', res));
  await new Promise(r => server.close(r));
});

test('WebSocket connection requires token', async () => {
  const server = await start();
  const port = server.address().port;
  const ws = new WebSocket(`ws://localhost:${port}/ws`);
  await new Promise(res => ws.on('error', res));
  await new Promise(r => server.close(r));
});

test('WebSocket connection rejects invalid token', async () => {
  const server = await start();
  const port = server.address().port;
  const ws = new WebSocket(`ws://localhost:${port}/ws?token=bad`);
  await new Promise(res => ws.on('error', res));
  await new Promise(r => server.close(r));
});

test('POST /api/projects creates project', async () => {
  const server = await start();
  const port = server.address().port;
  const reg = await fetch(`http://localhost:${port}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'proj', email: 'p@p.com', password: 'p' })
  });
  const { token } = await reg.json();
  const res = await fetch(`http://localhost:${port}/api/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ name: 'Project A', description: 'test' })
  });
  const data = await res.json();
  assert.strictEqual(res.status, 200);
  assert.strictEqual(data.name, 'Project A');
  await new Promise(r => server.close(r));
});

test('GET /api/projects lists projects', async () => {
  const server = await start();
  const port = server.address().port;
  const reg = await fetch(`http://localhost:${port}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'listp', email: 'l@p.com', password: 'p' })
  });
  const { token } = await reg.json();
  await fetch(`http://localhost:${port}/api/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ name: 'Proj1' })
  });
  const res = await fetch(`http://localhost:${port}/api/projects`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  assert.ok(Array.isArray(data));
  assert.strictEqual(data.length, 1);
  assert.strictEqual(data[0].name, 'Proj1');
  await new Promise(r => server.close(r));
});

test('GET /api/hive/logs supports pagination', async () => {
  const server = await start();
  const port = server.address().port;
  const reg = await fetch(`http://localhost:${port}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'pag', email: 'p@g.com', password: 'p' })
  });
  const { token } = await reg.json();
  for (let i = 0; i < 3; i++) {
    await fetch(`http://localhost:${port}/api/hive/log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ message: 'm' + i })
    });
  }
  const res = await fetch(`http://localhost:${port}/api/hive/logs?page=2&limit=1`);
  const data = await res.json();
  assert.strictEqual(data.length, 1);
  await new Promise(r => server.close(r));
});

test('POST /api/workflows/:id/execute queues workflow', async () => {
  const server = await start();
  const port = server.address().port;
  const reg = await fetch(`http://localhost:${port}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'wf', email: 'wf@e.com', password: 'p' })
  });
  const { token } = await reg.json();
  const { getPool } = require('../db');
  const pool = getPool();
  const userId = (await pool.query('SELECT id FROM users WHERE username = $1', ['wf'])).rows[0].id;
  const pId = (await pool.query('INSERT INTO projects (user_id, name) VALUES ($1,$2) RETURNING id', [userId, 'P'])).rows[0].id;
  const wId = (await pool.query('INSERT INTO workflows (project_id, name, definition) VALUES ($1,$2,$3) RETURNING id', [pId, 'W', '{}'])).rows[0].id;
  const res = await fetch(`http://localhost:${port}/api/workflows/${wId}/execute`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  assert.strictEqual(res.status, 200);
  assert.strictEqual(data.queued, true);
  const last = (await pool.query('SELECT last_run FROM workflows WHERE id = $1', [wId])).rows[0].last_run;
  assert.ok(last);
  await new Promise(r => server.close(r));
});
