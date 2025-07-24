# Project Milestones

## Milestone 1 - Environment Setup
*Target:* 2025-01-05  \
*Lead:* Alice
- [x] Create Docker based infrastructure with `docker-compose.yml` for frontend, backend and PostgreSQL.
- [x] Provide installation script `install.sh` to configure Docker and NGINX with HTTPS.
- [x] Add `update.sh` script to pull latest code and rebuild containers.

## Milestone 2 - Backend Skeleton
*Target:* 2025-01-20  \
*Lead:* Bob
- [x] Implement minimal Node based MCP server exposing WebSocket on port 3008.
- [x] Connect server to PostgreSQL using environment variable `DATABASE_URL`.
- [x] Add basic health check endpoint.

## Milestone 3 - Frontend Integration
*Target:* 2025-02-15  \
*Lead:* Carol
- [ ] Containerize the React application for production.
- [ ] Establish WebSocket connection from UI to backend MCP server.
- [ ] Visualize tool list retrieved from `/tools/list` endpoint.

## Milestone 4 - Persistent Sessions
*Target:* 2025-03-10  \
*Lead:* Dave
- [ ] Implement session storage in the backend.
- [ ] Add load/save functionality in the React flow canvas.

## Milestone 5 - Advanced Features
*Target:* 2025-04-01  \
*Lead:* Eve
- [ ] Live monitoring of hive activity via WebSocket events.
- [ ] Dashboard for neural network training metrics.

This file will be updated as milestones are completed.
## Sprint Jul-24-2025
*Start:* 2025-07-24  \
*End:* 2025-07-26  \
*Lead:* Codex Team
- [x] **Feature:** Implement backend MCP API according to `backend.md`. (@backend-agent)
- [x] **Bugfix:** Add persistence layer and migrations for PostgreSQL. (@backend-agent)
- [x] **Test:** Write unit tests for frontend and backend. (@qa-agent)
- [ ] **Doc:** Update README and API documentation. (@frontend-agent)

## Sprint Jul-27-2025
*Start:* 2025-07-27  \
*End:* 2025-07-29  \
*Lead:* Codex Team
- [ ] **Feature:** Extend React Flow canvas with save/load sessions. (@frontend-agent)
- [ ] **Test:** Implement CI/CD pipeline running unit tests. (@qa-agent)
- [ ] **Bugfix:** Finalize backend MCP API with database persistence. (@backend-agent)

