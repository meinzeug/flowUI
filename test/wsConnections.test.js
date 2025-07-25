const { test } = require('node:test');
const assert = require('assert');
const EventEmitter = require('events');
const { storeConnection, getConnections } = require('../middlewares/wsConnections');

function createWs() {
  const ws = new EventEmitter();
  ws.readyState = 1;
  ws.close = () => ws.emit('close');
  return ws;
}

test('storeConnection adds and removes connections', () => {
  const ws = createWs();
  storeConnection('u1', ws);
  assert.strictEqual(getConnections('u1').length, 1);
  ws.close();
  assert.strictEqual(getConnections('u1').length, 0);
});
