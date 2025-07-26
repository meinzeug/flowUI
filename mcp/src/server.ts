import { WebSocketServer } from 'ws';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { runBatch, runFlow } from './cli.js';

dotenv.config();

const PORT = Number(process.env.MCP_PORT) || 3008;
const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';

const wss = new WebSocketServer({ port: PORT });

wss.on('connection', ws => {
  ws.once('message', async (data) => {
    let msg;
    try { msg = JSON.parse(data.toString()); } catch { ws.close(); return; }
    const token = msg.token as string | undefined;
    if (!token) { ws.close(); return; }
    try { jwt.verify(token, JWT_SECRET); }
    catch { ws.close(); return; }

    ws.on('message', async d => {
      let payload: any;
      try { payload = JSON.parse(d.toString()); } catch { return; }
      if (payload.event === 'tools/batch') {
        const result = await runBatch(payload.args || []);
        ws.send(JSON.stringify({ event: 'batchResult', result }));
      } else if (payload.event === 'tools/run') {
        const result = await runFlow(payload.flow);
        ws.send(JSON.stringify({ event: 'runResult', result }));
      }
    });
  });
});

if (process.env.NODE_ENV !== 'test') {
  console.log(`MCP service listening on ${PORT}`);
}
