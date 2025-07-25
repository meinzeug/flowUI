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
- `tool_calls` - logs executed tools
### REST API
- `GET /health` - returns `{ status: 'ok' }` if the server and database are reachable.
- `GET /tools/list` - lists all available MCP tools grouped by category.
- `GET /tools/info/:name` - returns details for a single tool.
- `POST /tools/call` - executes a tool and records the call.
- `POST /tools/batch` - executes multiple tools in one request.
- `POST /session/save` - persists or updates a session graph.
- `POST /session/load` - loads a previously saved session by id.
- `GET /session/list` - lists saved sessions.
- `POST /memory/store` - stores a memory entry `{namespace, query, summary}` and returns an id.
- `POST /memory/query` - searches stored entries by namespace and query.
- `POST /api/auth/login` - authenticates user and returns a JWT token.
