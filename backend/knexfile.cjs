module.exports = {
  client: 'pg',
  connection: process.env.DATABASE_URL || 'postgres://flowuser:flowpass@localhost:5432/flowdb',
  migrations: {
    directory: './migrations'
  }
};
