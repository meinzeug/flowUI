export type RPCRequest = {
    id: number;
    method: string;
    params?: any;
};

export type RPCResponse = {
    id: number | null;
    result?: any;
    error?: { code: number; message: string };
};

class WebSocketService {
    private ws?: WebSocket;
    private nextId = 1;
    private pending: Map<number, (res: RPCResponse) => void> = new Map();
    private listeners: Record<string, ((data: any) => void)[]> = {};
    private url: string;
    private heartbeatInterval?: number;
    private authToken: string | null = localStorage.getItem('token');

    constructor(url?: string) {
        if (url) {
            this.url = url;
        } else if (import.meta.env.VITE_WS_URL) {
            this.url = import.meta.env.VITE_WS_URL;
        } else {
            const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
            const host = window.location.host;
            // Use trailing slash so NGINX location /api/ matches
            this.url = `${protocol}://${host}/api/`;
        }
        
        this.connect();
    }

    private buildUrl() {
        if (this.authToken) {
            const sep = this.url.includes('?') ? '&' : '?';
            return `${this.url}${sep}token=${encodeURIComponent(this.authToken)}`;
        }
        return this.url;
    }

    private connect() {
        this.ws = new WebSocket(this.buildUrl());
        this.ws.addEventListener('open', () => {
            this.startHeartbeat();
        });
        this.ws.addEventListener('error', () => {
            console.error('WebSocket connection error');
        });
        this.ws.addEventListener('message', ev => {
            try {
                const data = JSON.parse(ev.data as string);
                if (data.event) {
                    this.emit(data.event, data.data);
                    return;
                }
                const handler = this.pending.get(data.id ?? 0);
                if (handler) {
                    handler(data);
                    this.pending.delete(data.id ?? 0);
                }
            } catch {
                // ignore
            }
        });
        this.ws.addEventListener('close', () => {
            this.stopHeartbeat();
            setTimeout(() => this.connect(), 1000);
        });
    }

    private startHeartbeat() {
        this.heartbeatInterval = window.setInterval(() => {
            if (this.ws?.readyState === WebSocket.OPEN) {
                this.ws.send('ping');
            }
        }, 10000);
    }

    private stopHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = undefined;
        }
    }

    on(event: string, handler: (data: any) => void) {
        this.listeners[event] = this.listeners[event] || [];
        this.listeners[event].push(handler);
    }

    private emit(event: string, data: any) {
        (this.listeners[event] || []).forEach(fn => fn(data));
    }

    call(method: string, params?: any): Promise<any> {
        const id = this.nextId++;
        const request: RPCRequest = { jsonrpc: '2.0', id, method, params } as any;
        return new Promise(resolve => {
            this.pending.set(id, res => resolve(res.result));
            this.ws?.send(JSON.stringify(request));
        });
    }

    setAuthToken(token: string | null) {
        if (this.authToken === token) return;
        this.authToken = token;
        if (!this.ws) {
            this.connect();
            return;
        }
        if (this.ws.readyState === WebSocket.OPEN) {
            this.ws.close();
        } else if (this.ws.readyState === WebSocket.CLOSED) {
            this.connect();
        }
    }
}

export const wsService = new WebSocketService();

export default WebSocketService;
