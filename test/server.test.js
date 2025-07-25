const { test } = require('node:test');
const assert = require('assert');
const fetch = global.fetch;
const { startServer } = require('../server');

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

test('GET /api/users returns users array', async () => {
  const server = await start();
  const port = server.address().port;
  await fetch(`http://localhost:${port}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'dave', email: 'd@d.com', password: 'p' })
  });
  const loginRes = await fetch(`http://localhost:${port}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'dave', password: 'p' })
  });
  const { token } = await loginRes.json();
  const res = await fetch(`http://localhost:${port}/api/users`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  assert.strictEqual(res.status, 200);
  assert.ok(Array.isArray(data));
  assert.ok(data.some(u => u.username === 'dave'));
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
