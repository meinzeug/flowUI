import test from 'node:test';
import assert from 'assert';
import { enqueueTask, startWorker, stopWorker, queue } from '../worker.js';

function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

test('worker processes queued tasks', { concurrency: 1 }, async () => {
  stopWorker();
  queue.length = 0;
  let received;
  startWorker((channel, payload) => { received = { channel, payload }; });
  enqueueTask({ id: 't1', channel: 'test', payload: { foo: 'bar' } });
  await delay(1100);
  stopWorker();
  assert.strictEqual(received.channel, 'test');
  assert.deepStrictEqual(received.payload, { taskId: 't1', foo: 'bar', status: 'done' });
  assert.strictEqual(queue.length, 0);
});
