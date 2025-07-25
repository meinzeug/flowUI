import { describe, it, expect, vi, beforeAll } from 'vitest';

class MockWebSocket {
  url: string;
  readyState = 1;
  send = vi.fn();
  listeners: Record<string, Function[]> = {};
  constructor(url: string) {
    this.url = url;
  }
  addEventListener(type: string, cb: Function) {
    this.listeners[type] = this.listeners[type] || [];
    this.listeners[type].push(cb);
    if (type === 'open') cb();
  }
  dispatch(type: string, event: any) {
    (this.listeners[type] || []).forEach(fn => fn(event));
  }
}

(global as any).window = {
  location: { hostname: 'localhost' },
  setInterval,
  clearInterval,
};
(global as any).localStorage = { getItem: () => null, setItem: () => {} } as any;
// @ts-ignore
global.WebSocket = MockWebSocket;

let WebSocketService: any;
beforeAll(async () => {
  WebSocketService = (await import('./WebSocketService')).default;
});

describe('WebSocketService', () => {
  it('sends request and resolves with response', async () => {
    const svc = new WebSocketService('ws://test');
    const ws = (svc as any).ws as MockWebSocket;
    const promise = svc.call('tools/list');
    const sent = ws.send.mock.calls[0][0];
    const { id } = JSON.parse(sent);
    ws.dispatch('message', { data: JSON.stringify({ jsonrpc: '2.0', id, result: 'ok' }) });
    const result = await promise;
    expect(result).toBe('ok');
  });

  it('emits events to listeners', async () => {
    const svc = new WebSocketService('ws://test');
    const ws = (svc as any).ws as MockWebSocket;
    const received: any[] = [];
    svc.on('hive-log', d => received.push(d));
    ws.dispatch('message', { data: JSON.stringify({ event: 'hive-log', data: { message: 'hi' } }) });
    expect(received[0].message).toBe('hi');
  });

  it('emits batch events', async () => {
    const svc = new WebSocketService('ws://test');
    const ws = (svc as any).ws as MockWebSocket;
    const batches: any[] = [];
    svc.on('hive-log-batch', b => batches.push(b));
    ws.dispatch('message', { data: JSON.stringify({ event: 'hive-log-batch', data: [{ message: 'x' }] }) });
    expect(batches[0][0].message).toBe('x');
  });

  it('reconnects after close', () => {
    vi.useFakeTimers();
    const svc = new WebSocketService('ws://test');
    const ws1 = (svc as any).ws as MockWebSocket;
    ws1.dispatch('close', {});
    vi.advanceTimersByTime(1000);
    const ws2 = (svc as any).ws as MockWebSocket;
    expect(ws2).not.toBe(ws1);
    vi.useRealTimers();
  });
});
