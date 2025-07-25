const connections = new Map();

function storeConnection(userId, ws) {
  let set = connections.get(userId);
  if (!set) {
    set = new Set();
    connections.set(userId, set);
  }
  set.add(ws);
  ws.on('close', () => {
    set.delete(ws);
    if (set.size === 0) {
      connections.delete(userId);
    }
  });
}

function getConnections(userId) {
  return Array.from(connections.get(userId) || []);
}

module.exports = { storeConnection, getConnections };
