import test from 'node:test';
import assert from 'assert';
import { startServer } from '../server.js';

test('GET /health returns ok', async () => {
  const server = startServer(0);
  const port = server.address().port;
  const res = await fetch(`http://localhost:${port}/health`);
  const data = await res.json();
  server.close();
  assert.strictEqual(res.status, 200);
  assert.deepStrictEqual(data, { status: 'ok' });
});
