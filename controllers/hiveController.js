const { broadcast } = require('../ws');

function logActivity(req, res) {
  const { message, type = 'info' } = req.body;
  const entry = { message, type, timestamp: new Date().toISOString() };
  broadcast('hive-log', entry);
  res.json({ status: 'sent' });
}

module.exports = { logActivity };
