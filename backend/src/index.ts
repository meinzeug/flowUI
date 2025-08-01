import express, { Request, Response, NextFunction } from 'express';
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

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET not set');
  process.exit(1);
}

const app = express();
app.use(express.json());
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({ error: 'invalid_json' });
  }
  next(err);
});
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
