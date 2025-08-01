
2025-09-18: Updated documentation and AGENTS instructions.
2025-09-12: Added workflow log API, WebSocket events and frontend log viewer.
2025-09-10: Added workflow cancel endpoint with frontend button and documented events.

2025-09-09: Added workflow queue endpoint, frontend queue view with progress and migration fixes.
v0.2.0-alpha
2025-09-07: Completed project API CRUD, added frontend delete UI and login/register error handling. Optimized backend tests with shared DB module.
2025-09-06: Added database migrations, project endpoints and workflow persistence.
2025-09-08: Automatically run backend migrations on startup and in tests, fixed missing workflow_queue table error.
DEPRECATION: Vollständige Entfernung der von Gemini generierten, nicht-funktionalen WebSocket-Platzhalterimplementierung.
2025-08-22: Added project CRUD API and documentation.
2025-08-08: Switched WebSocket endpoint to /ws, updated NGINX, frontend WebSocketService and tests.
2025-08-04: Added hive log WebSocket broadcasting with frontend listener and tests.
2025-07-24: Initialized project.
2025-07-25: Implemented tool info endpoint and added backend tests.
2025-07-26: Added memory store/query endpoints and updated docs.
2025-07-24: Configured Vitest to ignore node_modules and ran automated tests.

2025-07-27: Verified DashboardLoader issue not reproducible, updated sprint tasks and documentation.

FE-CTRL-S: 564bced 2025-07-24
CI-WORKFLOW: 8d2a2b5 2025-07-24
BE-AUTH: 963bda5 2025-07-24 login API

FE-SAVELOAD: 7a8df9c 2025-07-24 session list + tool call persistence

2025-07-25: Added session selector and tests for WorkflowsView
2025-08-02: Added HTTP /tools/batch endpoint with tests.
2025-08-03: Initial Express backend with /api/test route.
2025-07-25: Added JWT auth middleware, database connection, and tests for Express backend.
2025-07-25: Added profile endpoint with auth, updated frontend Auth context to load user profile, and added tests.
2025-07-25: Added /api/status endpoint with user count, frontend ServerStatus component integrated into Header, and tests for both.
2025-07-25: Added /api/users endpoint with admin list view and tests.
2025-07-25: Added WebSocket endpoint and integration tests
2025-07-25: Added persistent hive log endpoints with websocket batch delivery and frontend integration.
2025-08-04: Added endpoint to clear hive logs with frontend button and tests.
2025-07-25: Added CI workflow to run backend and frontend tests on each commit
2025-07-25: Added deployment workflow triggered after tests to run update.sh via SSH.

2025-07-25: Added Docker image publishing workflow and updated README.
2025-07-25: Updated compose to use GHCR images, added docker build tests and docs.
2025-08-12: Added JWT WebSocket auth, connection tracking, reconnection tests and compose update.
2025-08-15: Added sendToUser, project/workflow tables, exportLogs CLI, wsConnections tests, and production docs.
2025-08-21: Added GHCR authentication with fallback to local build in install.sh, compose build contexts and updated docs.
2025-08-24: Added workflow execute endpoint with queue, hive log pagination and project components.
2025-09-01: Start Sprint 1 to fix WebSocket handshake.
2025-09-01: Fixed WebSocket handshake path and updated tests.
2025-09-02: Removed Gemini legacy WebSocket implementation and cleaned old server.
2025-09-03: Implemented WebSocketService with auto-reconnect, added worker queue and documented endpoints.
2025-07-25: Added REST backend, moved MCP server, updated compose and scripts.
2025-09-05: Added role-based auth with PostgreSQL persistence and admin /api/users endpoint.
fix(ProjectCreateModal): add placeholder/testid to input for robust testing
2025-07-26: Split REST API and MCP service into separate TypeScript projects, added Dockerfiles, compose updates and docs.
2025-07-26: Added workflow CRUD endpoints, queue worker execution and updated docs
2025-07-26: Added /api/profile endpoint with JWT auth and updated frontend docs and tests.
2025-09-10: Added queue item detail endpoint, frontend cancelled status color, updated docs.
2025-09-15: Projektstruktur in /codex/data konsolidiert.
2025-09-16: Removed Markdown files from repository root.
2025-09-17: Fixed Tailwind CSS integration, updated postcss config and added AGENTS instructions.
2025-09-20: Fixed overlay styles by safelisting Tailwind classes and adding fallback CSS.
