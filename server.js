require('dotenv').config();
const express = require('express');
const apiRoutes = require('./routes');
const errorHandler = require('./middlewares/errorHandler');
const { PORT } = require('./config/config');

const app = express();
app.use(express.json());

app.all('/', (req, res) => res.status(403).json({ error: 'Forbidden' }));
app.use('/api', apiRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
