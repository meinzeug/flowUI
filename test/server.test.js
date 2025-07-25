const { test } = require('node:test');
const assert = require('assert');
const fetch = global.fetch;
const { startServer } = require('../server');
const { WebSocket } = require('ws');

process.env.JWT_SECRET = 'testsecret';

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

test('POST /api/hive/log broadcasts to websocket clients', async () => {
  const server = await start();
  const port = server.address().port;

  const reg = await fetch(`http://localhost:${port}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'eve', email: 'e@e.com', password: 'p' })
  });
  const { token } = await reg.json();

  const ws = new WebSocket(`ws://localhost:${port}/ws?token=${token}`);
  await new Promise(res => ws.on('open', res));

  const logPromise = new Promise(resolve => {
    ws.on('message', data => resolve(JSON.parse(data)));
  });

  await fetch(`http://localhost:${port}/api/hive/log`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ message: 'hello' })
  });

  const msg = await logPromise;
  assert.strictEqual(msg.event, 'hive-log');
  assert.strictEqual(msg.data.message, 'hello');

  const listRes = await fetch(`http://localhost:${port}/api/hive/logs`);
  const list = await listRes.json();
  assert.ok(list.some(l => l.message === 'hello'));

  ws.close();
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
