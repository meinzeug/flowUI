import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { wsService } from './WebSocketService';

class MockWS {
  static instances: MockWS[] = [];
  onopen: (() => void) | null = null;
  onmessage: ((ev: { data: string }) => void) | null = null;
  onclose: (() => void) | null = null;
  readyState = WebSocket.CONNECTING;
  sent: string[] = [];
  constructor(public url: string) {
    MockWS.instances.push(this);
    queueMicrotask(() => {
      this.readyState = WebSocket.OPEN;
      this.onopen && this.onopen();
    });
  }
  send(data: string) { this.sent.push(data); }
  close() { this.readyState = WebSocket.CLOSED; this.onclose && this.onclose(); }
}
// @ts-ignore
global.WebSocket = MockWS as any;

describe('WebSocketService', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    wsService.close();
    MockWS.instances.length = 0;
  });
  afterEach(() => {
    wsService.close();
    vi.useRealTimers();
  });

  it('reconnects after close', async () => {
    wsService.connect();
    expect(MockWS.instances.length).toBe(1);
    MockWS.instances[0].close();
    await vi.advanceTimersByTimeAsync(1000);
    expect(MockWS.instances.length).toBe(2);
  });

  it('sends heartbeat pings', async () => {
    wsService.connect();
    await vi.advanceTimersByTimeAsync(30000);
    expect(MockWS.instances[0].sent).toContain(
      JSON.stringify({ event: 'ping', channel: '', payload: {} })
    );
  });
});
