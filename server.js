require('dotenv').config();
const express = require('express');
const http = require('http');
const { setupWebSocket } = require('./realtime');

const apiRoutes = require('./routes');
const errorHandler = require('./middlewares/errorHandler');
const { PORT } = require('./config/config');
const { initDb } = require('./db');

async function createServer() {
  await initDb();
  const app = express();
  app.use(express.json());

  app.all('/', (req, res) => res.status(403).json({ error: 'Forbidden' }));
  app.use('/api', apiRoutes);

  app.use(errorHandler);

  const server = http.createServer(app);

  setupWebSocket(server);

  return { app, server };
}

async function startServer(port = PORT) {
  const { server } = await createServer();
  return server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

if (require.main === module) {
  startServer();
}

module.exports = { createServer, startServer };
