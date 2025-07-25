export type WsMessage = { event: string; channel: string; payload: any };

type Handler = (payload: any, channel: string) => void;

class WebSocketService {
  private socket: WebSocket | null = null;
  private token: string | null = null;
  private reconnectDelay = 1000;
  private handlers: Map<string, Map<string, Set<Handler>>> = new Map();
  private channels: Set<string> = new Set();
  private heartbeat?: number;
  private reconnectTimer?: number;

  setAuthToken(token: string | null) {
    this.token = token;
    if (this.socket) {
      this.close();
      this.connect();
    }
  }

  connect() {
    if (this.socket) return;
    const url = `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/ws${this.token ? '?token=' + this.token : ''}`;
    this.socket = new WebSocket(url);

    this.socket.onopen = () => {
      this.reconnectDelay = 1000;
      this.startHeartbeat();
      for (const ch of this.channels) {
        this.sendRaw({ event: 'subscribe', channel: ch, payload: {} });
      }
    };

    this.socket.onmessage = ev => {
      let msg: WsMessage;
      try { msg = JSON.parse(ev.data); } catch { return; }
      if (msg.event === 'pong') return;
      const evMap = this.handlers.get(msg.event);
      const chanMap = evMap?.get(msg.channel);
      if (chanMap) for (const h of chanMap) h(msg.payload, msg.channel);
    };

    this.socket.onclose = () => {
      this.stopHeartbeat();
      this.socket = null;
      this.scheduleReconnect();
    };
  }

  private sendRaw(msg: WsMessage) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(msg));
    }
  }

  subscribe(channel: string) {
    this.channels.add(channel);
    this.sendRaw({ event: 'subscribe', channel, payload: {} });
  }

  unsubscribe(channel: string) {
    this.channels.delete(channel);
    this.sendRaw({ event: 'unsubscribe', channel, payload: {} });
  }

  send(channel: string, payload: any) {
    this.sendRaw({ event: 'message', channel, payload });
  }

  on(event: string, channel: string, handler: Handler) {
    if (!this.handlers.has(event)) this.handlers.set(event, new Map());
    const chanMap = this.handlers.get(event)!;
    if (!chanMap.has(channel)) chanMap.set(channel, new Set());
    chanMap.get(channel)!.add(handler);
  }

  close() {
    this.stopHeartbeat();
    if (this.socket) this.socket.close();
    this.socket = null;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = undefined;
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) return;
    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = undefined;
      this.connect();
      this.reconnectDelay = Math.min(this.reconnectDelay * 2, 30000);
    }, this.reconnectDelay);
  }

  private startHeartbeat() {
    this.heartbeat = window.setInterval(() => {
      this.sendRaw({ event: 'ping', channel: '', payload: {} });
    }, 30000);
  }

  private stopHeartbeat() {
    if (this.heartbeat) {
      clearInterval(this.heartbeat);
      this.heartbeat = undefined;
    }
  }
}

export const wsService = new WebSocketService();
