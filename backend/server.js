import express from 'express';
import { WebSocketServer } from 'ws';
import http from 'http';

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

wss.on('connection', ws => {
  ws.on('message', msg => {
    ws.send(JSON.stringify({ jsonrpc: '2.0', id: 1, result: 'ok' }));
  });
});

const port = process.env.PORT || 3008;
server.listen(port, () => {
  console.log(`MCP server listening on ${port}`);
});
