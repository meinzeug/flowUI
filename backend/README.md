# Backend

This directory contains the MCP server and database migrations.

## Running Migrations

Migrations are managed with [Knex](https://knexjs.org/). Use the commands below inside the `backend` directory:

```bash
# Apply all pending migrations
npm run migrate
```

To create a new migration:

```bash
npx knex --knexfile knexfile.cjs migrate:make <name>
```

To roll back the last batch:

```bash
npx knex --knexfile knexfile.cjs migrate:rollback
```

The Docker setup automatically runs `knex migrate:latest` when the backend container starts.

### Tables

Current migrations create the following tables:

- `memory_entries` - stores memory query results
- `activity_log` - records system log messages
- `sessions` - persists saved workflow graphs

