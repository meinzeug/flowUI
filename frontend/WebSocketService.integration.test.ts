/** @vitest-environment node */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { WebSocket } from 'ws';

let WebSocketService: any;
let server: any;
let port: number;

beforeAll(async () => {
  process.env.JWT_SECRET = 'testsecret';
  const srv = await import('../server');
  server = await srv.startServer(0);
  port = server.address().port;
  (global as any).WebSocket = WebSocket;
  const reg = await fetch(`http://localhost:${port}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'ws', email: 'ws@x.com', password: 'p' })
  });
  const { token } = await reg.json();
  (global as any).localStorage = { getItem: () => token } as any;
  (global as any).window = {
    location: { protocol: 'http:', host: `localhost:${port}` },
    setInterval,
    clearInterval,
  } as any;
  WebSocketService = (await import('./WebSocketService')).default;
});

afterAll(() => {
  server.close();
});

describe('WebSocketService integration', () => {
  it('connects and lists tools', async () => {
    const svc = new WebSocketService();
    await new Promise(res => (svc as any).ws.addEventListener('open', res));
    const result = await svc.call('tools/list');
    expect(Array.isArray(result)).toBe(true);
    (svc as any).ws.close();
  });

  it('receives hive log events', async () => {
    const svc = new WebSocketService();
    await new Promise(res => (svc as any).ws.addEventListener('open', res));
    const events: any[] = [];
    svc.on('hive-log', e => events.push(e));
    const reg = await fetch(`http://localhost:${port}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'int', email: 'int@x.com', password: 'p' })
    });
    const { token } = await reg.json();
    await fetch(`http://localhost:${port}/api/hive/log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ message: 'test' })
    });
    await new Promise(r => setTimeout(r, 50));
    expect(events[0].message).toBe('test');
    (svc as any).ws.close();
  });

  it('sends recent logs on connect', async () => {
    const reg = await fetch(`http://localhost:${port}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'batch', email: 'b@x.com', password: 'p' })
    });
    const { token } = await reg.json();
    await fetch(`http://localhost:${port}/api/hive/log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ message: 'batchlog' })
    });

    const svc = new WebSocketService();
    const batches: any[] = [];
    svc.on('hive-log-batch', b => batches.push(b));
    await new Promise(res => (svc as any).ws.addEventListener('open', res));
    await new Promise(r => setTimeout(r, 50));
    expect(batches[0].some((e: any) => e.message === 'batchlog')).toBe(true);
    (svc as any).ws.close();
  });
});
