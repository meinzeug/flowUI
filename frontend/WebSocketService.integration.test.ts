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
  (global as any).localStorage = { getItem: () => null } as any;
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
});
