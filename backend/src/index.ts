import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';
import db from './db.js';
import healthRoutes from './routes/healthRoutes.js';
import authRoutes from './routes/authRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import toolsRoutes from './routes/toolsRoutes.js';
import workflowRoutes from './routes/workflowRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import mcpProxy from './routes/mcpProxy.js';
import { startWorker } from './worker.js';
import { initWs } from './ws.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

app.use('/health', healthRoutes);
app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);
app.use('/tools', toolsRoutes);
app.use('/workflows', workflowRoutes);
app.use('/projects', projectRoutes);
app.use('/mcp', mcpProxy);

const PORT = Number(process.env.BACKEND_PORT) || 4000;

if (process.env.NODE_ENV !== 'test') {
  (async () => {
    await db.migrate.latest();
    const server = createServer(app);
    initWs(server);
    startWorker();
    server.listen(PORT, () => {
      console.log(`Backend listening on ${PORT}`);
    });
  })();
}

export default app;
