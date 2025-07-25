export type Message = { event: string; channel: string; payload: any };

class WebSocketService {
  private socket: WebSocket | null = null;
  private token: string | null = null;
  private listeners: Record<string, Set<(data: any) => void>> = {};
  private subscribed = new Set<string>();
  private reconnectTimer: any = null;

  constructor() {
    this.connect();
  }

  private buildUrl() {
    const base = import.meta.env.VITE_WS_URL || `ws://${location.host}/ws`;
    return this.token ? `${base}?token=${this.token}` : base;
  }

  setAuthToken(token: string | null) {
    if (this.token !== token) {
      this.token = token;
      this.reconnect();
    }
  }

  private reconnect() {
    if (this.socket) {
      this.socket.close();
    } else {
      this.connect();
    }
  }

  private connect() {
    const url = this.buildUrl();
    this.socket = new WebSocket(url);

    this.socket.onopen = () => {
      this.subscribed.forEach(ch => {
        this.send({ event: 'subscribe', channel: ch, payload: {} });
      });
    };

    this.socket.onmessage = (e) => {
      try {
        const msg: Message = JSON.parse(e.data);
        const key = msg.channel || msg.event;
        this.emit(key, msg.payload);
      } catch {
        // ignore
      }
    };

    this.socket.onclose = () => {
      this.socket = null;
      if (!this.reconnectTimer) {
        this.reconnectTimer = setTimeout(() => {
          this.reconnectTimer = null;
          this.connect();
        }, 1000);
      }
    };
  }

  private send(msg: Message) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(msg));
    }
  }

  subscribe(channel: string) {
    this.subscribed.add(channel);
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.send({ event: 'subscribe', channel, payload: {} });
    }
  }

  unsubscribe(channel: string) {
    this.subscribed.delete(channel);
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.send({ event: 'unsubscribe', channel, payload: {} });
    }
  }

  on(channel: string, handler: (data: any) => void) {
    if (!this.listeners[channel]) this.listeners[channel] = new Set();
    this.listeners[channel].add(handler);
    this.subscribe(channel);
  }

  off(channel: string, handler: (data: any) => void) {
    this.listeners[channel]?.delete(handler);
  }

  publish(channel: string, payload: any) {
    this.send({ event: 'publish', channel, payload });
  }

  private emit(channel: string, data: any) {
    this.listeners[channel]?.forEach(fn => fn(data));
  }

  // fallback HTTP calls for legacy API usage
  async call(method: string, params?: any): Promise<any> {
    if (method === 'tools/list') {
      const res = await fetch('/tools/list');
      return res.json();
    }
    if (method === 'tools/call') {
      const res = await fetch('/tools/call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      return res.json();
    }
    if (method === 'tools/batch') {
      const res = await fetch('/tools/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      return res.json();
    }
    throw new Error('unknown method');
  }
}

export const wsService = new WebSocketService();
export default WebSocketService;
