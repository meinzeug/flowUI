import { describe, it, expect, vi } from 'vitest';
import WebSocketService from './WebSocketService';

class MockSocket {
  static instances: MockSocket[] = [];
  readyState = 0;
  onopen: () => void = () => {};
  onclose: () => void = () => {};
  onmessage: (e: { data: string }) => void = () => {};
  constructor(public url: string) {
    MockSocket.instances.push(this);
  }
  send = vi.fn();
  close() {
    this.readyState = 3;
    this.onclose();
  }
  triggerOpen() {
    this.readyState = 1;
    this.onopen();
  }
}

describe('WebSocketService', () => {
  it('reconnects after close', () => {
    vi.useFakeTimers();
    (global as any).WebSocket = MockSocket as any;
    const service = new WebSocketService();
    const first = MockSocket.instances[0];
    first.triggerOpen();
    expect(MockSocket.instances.length).toBe(1);
    first.close();
    vi.advanceTimersByTime(1000);
    expect(MockSocket.instances.length).toBe(2);
    vi.useRealTimers();
  });
});
