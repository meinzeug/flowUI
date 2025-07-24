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
    private url: string;
    private heartbeatInterval?: number;

    constructor(url = `ws://${window.location.hostname}:3008`) {
        this.url = url;
        this.connect();
    }

    private connect() {
        this.ws = new WebSocket(this.url);
        this.ws.addEventListener('open', () => {
            this.startHeartbeat();
        });
        this.ws.addEventListener('message', ev => {
            try {
                const data: RPCResponse = JSON.parse(ev.data as string);
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

    call(method: string, params?: any): Promise<any> {
        const id = this.nextId++;
        const request: RPCRequest = { jsonrpc: '2.0', id, method, params } as any;
        return new Promise(resolve => {
            this.pending.set(id, res => resolve(res.result));
            this.ws?.send(JSON.stringify(request));
        });
    }
}

export const wsService = new WebSocketService();

export default WebSocketService;
