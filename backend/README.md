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
- `GET https://$domain/api/health` - returns `{ status: 'ok' }` if the server and database are reachable.
- `GET https://$domain/api/tools/list` - lists all available MCP tools grouped by category.
- `GET https://$domain/api/tools/info/:name` - returns details for a single tool.
- `POST https://$domain/api/tools/call` - executes a tool and records the call.
- `POST https://$domain/api/session/save` - persists or updates a session graph.
- `POST https://$domain/api/session/load` - loads a previously saved session by id.
- `GET https://$domain/api/session/list` - lists saved sessions.
- `POST https://$domain/api/memory/store` - stores a memory entry `{namespace, query, summary}` and returns an id.
- `POST https://$domain/api/memory/query` - searches stored entries by namespace and query.
- `POST https://$domain/api/auth/login` - authenticates user and returns a JWT token.
