import assert from 'assert';
import { once } from 'events';
import { test } from 'node:test';
import app from './index.js';
import db from './db.js';

export async function startServer() {
  await db.migrate.latest();
  const server = app.listen(0);
  await once(server, 'listening');
  return server;
}

test('GET /health', async () => {
  const server = await startServer();
  const port = (server.address() as any).port;
  const res = await fetch(`http://localhost:${port}/health`);
  const data = await res.json();
  assert.deepStrictEqual(data, { status: 'ok' });
  server.close();
  await once(server, 'close');
  await db.destroy();
});
