# Project Milestones

## Milestone 1 - Environment Setup
*Target:* 2025-01-05  \
*Lead:* Alice
- [x] Create Docker based infrastructure with `docker-compose.yml` for frontend, backend and PostgreSQL.
- [x] Provide installation script `install.sh` to configure Docker and NGINX with HTTPS.
- [x] Add `update.sh` script to pull latest code and rebuild containers.
- [x] Document installation procedure in `README.md`.
- [x] Verify infrastructure with initial smoke tests.

## Milestone 2 - Backend Skeleton
*Target:* 2025-01-20  \
*Lead:* Bob
- [x] Implement minimal Node based MCP server exposing WebSocket on port 3008.
- [x] Connect server to PostgreSQL using environment variable `DATABASE_URL`.
- [x] Add basic health check endpoint.
- [x] Provide initial tool catalog via `/tools/list`.
- [x] Set up jest/vitest based test runner.

## Milestone 3 - Frontend Integration
*Target:* 2025-02-15  \
*Lead:* Carol
- [x] Containerize the React application for production.
- [x] Establish WebSocket connection from UI to backend MCP server.
- [x] Visualize tool list retrieved from `/tools/list` endpoint.
- [x] Implement basic flow canvas with drag&drop of tools.
- [x] Add unit tests for WebSocketService and FlowEditor.

## Milestone 4 - Persistent Sessions
*Target:* 2025-03-10  \
*Lead:* Dave
- [x] Implement session storage in the backend with PostgreSQL tables.
- [x] Add load/save functionality in the React flow canvas.
- [x] Provide REST API to list available sessions.
- [x] Write migrations and automate with `npm run migrate`.
- [x] Cover persistence logic with integration tests.

## Milestone 5 - Advanced Features
*Target:* 2025-04-01  \
*Lead:* Eve
- [ ] Live monitoring of hive activity via WebSocket events.
- [ ] Dashboard for neural network training metrics.
- [ ] Memory search interface with query suggestions.
- [ ] Visualization of agent resource usage on canvas.
- [ ] Export/import workflow graphs as JSON templates.

## Milestone 6 - CI/CD and Deployment
*Target:* 2025-04-20  \
*Lead:* Frank
- [ ] Build GitHub Actions pipeline running frontend and backend tests.
- [ ] Publish Docker images for backend and frontend.
- [ ] Deploy containers via Docker Compose in staging environment.
- [ ] Generate coverage reports on each pull request.
- [ ] Automate changelog generation from Git history.

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
- [x] **Feature:** Extend React Flow canvas with save/load sessions. (@frontend-agent)
- [ ] **Test:** Implement CI/CD pipeline running unit tests. (@qa-agent)
- [ ] **Bugfix:** Finalize backend MCP API with database persistence. (@backend-agent)

## Sprint Jul-30-2025
*Start:* 2025-07-30  \
*End:* 2025-08-01  \
*Lead:* Codex Team
- [x] **Bugfix:** Investigate and resolve DashboardLoader error. (@frontend-agent)
- [x] **Doc:** Document debugging outcome in bericht.html. (@frontend-agent)
- [ ] **Feature:** Prepare deployment scripts for CI/CD pipeline. (@backend-agent)

## Sprint Aug-02-2025
*Start:* 2025-08-02  \
*End:* 2025-08-04  \
*Lead:* Codex Team
- [x] **Feature:** Add HTTP `/tools/batch` endpoint and tests. (@backend-agent)
- [ ] **Test:** Expand coverage for REST API. (@qa-agent)

## Sprint Jul-24b-2025
*Start:* 2025-07-24  \
*End:* 2025-07-26  \
*Lead:* Codex Team
- [x] **Bugfix:** Configure Vitest to run only project tests. (@frontend-agent)
- [x] **Test:** Ensure backend and frontend tests pass. (@qa-agent)
- [ ] **Doc:** Document debugging process in bericht.html. (@frontend-agent)

## Sprint Jul-24c-2025
*Start:* 2025-07-24  \
*End:* 2025-07-26  \
*Lead:* Codex Team
- [x] **Test:** Add DashboardView render test and update vitest config. (@frontend-agent)
- [ ] **Doc:** Summarize progress in bericht.html. (@frontend-agent)
