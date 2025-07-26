import { WebSocketServer, WebSocket } from 'ws';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';

const channels: Map<string, Set<WebSocket>> = new Map();

export function initWs(server: any) {
  const wss = new WebSocketServer({ server, path: '/ws' });
  wss.on('connection', (ws, req) => {
    const url = new URL(req.url || '', 'http://localhost');
    const token = url.searchParams.get('token');
    if (!token) { ws.close(); return; }
    try { jwt.verify(token, JWT_SECRET); } catch { ws.close(); return; }

    ws.on('message', data => {
      let msg: any;
      try { msg = JSON.parse(data.toString()); } catch { return; }
      if (msg.event === 'subscribe') {
        const set = channels.get(msg.channel) || new Set();
        set.add(ws);
        channels.set(msg.channel, set);
        ws.send(JSON.stringify({ event: 'subscribed', channel: msg.channel, payload: {} }));
      } else if (msg.event === 'unsubscribe') {
        const set = channels.get(msg.channel);
        set?.delete(ws);
        ws.send(JSON.stringify({ event: 'unsubscribed', channel: msg.channel, payload: {} }));
      } else if (msg.event === 'ping') {
        ws.send(JSON.stringify({ event: 'pong', channel: '', payload: {} }));
      }
    });

    ws.on('close', () => {
      for (const set of channels.values()) set.delete(ws);
    });
  });
}

export function broadcast(channel: string, event: string, payload: any) {
  const set = channels.get(channel);
  if (!set) return;
  const msg = JSON.stringify({ event, channel, payload });
  for (const ws of set) if (ws.readyState === WebSocket.OPEN) ws.send(msg);
}
