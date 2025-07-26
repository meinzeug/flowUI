# Project Milestones

This document outlines the roadmap for building **Flow Weaver**, a web-based GUI for Claude-Flow v2.0.0 Alpha. Each milestone includes a target date, responsible lead, a short goal description and a checklist of tasks. Items are continuously updated with the current status.

## Milestone 1 - Environment Setup
*Target:* 2025-01-05  \
*Lead:* Alice
**Goal:** Prepare the basic infrastructure for local development and containerized deployment.
- [x] Create Docker based infrastructure with `docker-compose.yml` for frontend, backend and PostgreSQL.
- [x] Provide installation script `install.sh` to configure Docker and NGINX with HTTPS.
- [x] Add `update.sh` script to pull latest code and rebuild containers.
- [x] Document installation procedure in `README.md`.
- [x] Verify infrastructure with initial smoke tests.

## Milestone 2 - Backend Skeleton
*Target:* 2025-01-20  \
*Lead:* Bob
**Goal:** Deliver a minimal MCP server exposing WebSocket and REST endpoints.
- [x] Implement Node based MCP server exposing WebSocket on port 3008.
- [x] Connect server to PostgreSQL using environment variable `DATABASE_URL`.
- [x] Add basic health check endpoint.
- [x] Provide initial tool catalog via `/tools/list`.
- [x] Set up jest/vitest based test runner.

## Milestone 3 - Frontend Integration
*Target:* 2025-02-15  \
*Lead:* Carol
**Goal:** Provide a functional React prototype that communicates with the MCP server.
- [x] Containerize the React application for production.
- [x] Establish WebSocket connection from UI to backend MCP server.
- [x] Visualize tool list retrieved from `/tools/list` endpoint.
- [x] Implement basic flow canvas with drag&drop of tools.
- [x] Add unit tests for WebSocketService and FlowEditor.

## Milestone 4 - Persistent Sessions
*Target:* 2025-03-10  \
*Lead:* Dave
**Goal:** Allow saving and loading of workflow graphs.
- [x] Implement session storage in the backend with PostgreSQL tables.
- [x] Add load/save functionality in the React flow canvas.
- [x] Provide REST API to list available sessions.
- [x] Write migrations and automate with `npm run migrate`.
- [x] Cover persistence logic with integration tests.

## Milestone 5 - Advanced Features
*Target:* 2025-04-01  \
*Lead:* Eve
**Goal:** Extend the application with real-time monitoring and advanced visualization.
- [ ] Live monitoring of hive activity via WebSocket events.
 - [x] Dashboard for neural network training metrics.
- [x] Memory search interface with query suggestions.
- [ ] Visualization of agent resource usage on canvas.
- [ ] Export/import workflow graphs as JSON templates.
- [x] Export/import workflow graphs as JSON templates.

## Milestone 6 - CI/CD and Deployment
*Target:* 2025-04-20  \
*Lead:* Frank
**Goal:** Automate testing and deployment of the platform.
- [x] Build GitHub Actions pipeline running frontend and backend tests.
- [x] Publish Docker images for backend and frontend.
- [ ] Deploy containers via Docker Compose in staging environment.
- [ ] Generate coverage reports on each pull request.
- [ ] Automate changelog generation from Git history.

## Milestone 7 - Documentation and Polish
*Target:* 2025-05-10  \
*Lead:* Grace
**Goal:** Finalize user-facing documentation and perform last QA before beta release.
- [ ] Complete README with setup instructions and architecture diagrams.
- [ ] Update API documentation in `docs/` to match the implemented endpoints.
- [ ] Review and clean up code comments and typings.
- [ ] Conduct full accessibility audit of the UI.
- [ ] Prepare release notes and upgrade guide.

---

## Sprint History
The following sprints track short term progress inside the larger milestones.

### Sprint Jul-24-2025
*Start:* 2025-07-24  \
*End:* 2025-07-26  \
*Lead:* Codex Team
- [x] **Feature:** Implement backend MCP API according to `backend.md`. (@backend-agent)
- [x] **Bugfix:** Add persistence layer and migrations for PostgreSQL. (@backend-agent)
- [x] **Test:** Write unit tests for frontend and backend. (@qa-agent)
- [ ] **Doc:** Update README and API documentation. (@frontend-agent)

### Sprint Jul-27-2025
*Start:* 2025-07-27  \
*End:* 2025-07-29  \
*Lead:* Codex Team
- [x] **Feature:** Extend React Flow canvas with save/load sessions. (@frontend-agent)
 - [x] **Test:** Implement CI/CD pipeline running unit tests. (@qa-agent)
- [ ] **Bugfix:** Finalize backend MCP API with database persistence. (@backend-agent)

### Sprint Jul-30-2025
*Start:* 2025-07-30  \
*End:* 2025-08-01  \
*Lead:* Codex Team
- [x] **Bugfix:** Investigate and resolve DashboardLoader error. (@frontend-agent)
- [x] **Doc:** Document debugging outcome in bericht.html. (@frontend-agent)
 - [x] **Feature:** Prepare deployment scripts for CI/CD pipeline. (@backend-agent)

### Sprint Aug-02-2025
*Start:* 2025-08-02  \
*End:* 2025-08-04  \
*Lead:* Codex Team
- [x] **Feature:** Add HTTP `/tools/batch` endpoint and tests. (@backend-agent)
- [ ] **Test:** Expand coverage for REST API. (@qa-agent)

### Sprint Jul-24b-2025
*Start:* 2025-07-24  \
*End:* 2025-07-26  \
*Lead:* Codex Team
- [x] **Bugfix:** Configure Vitest to run only project tests. (@frontend-agent)
- [x] **Test:** Ensure backend and frontend tests pass. (@qa-agent)
- [ ] **Doc:** Document debugging process in bericht.html. (@frontend-agent)

### Sprint Jul-24c-2025
*Start:* 2025-07-24  \
*End:* 2025-07-26  \
*Lead:* Codex Team
- [x] **Test:** Add DashboardView render test and update vitest config. (@frontend-agent)
- [ ] **Doc:** Summarize progress in bericht.html. (@frontend-agent)

### Sprint Aug-05-2025
*Start:* 2025-08-05  \
*End:* 2025-08-07  \
*Lead:* Codex Team
- [x] **Feature:** Create Docker image publish workflow. (@backend-agent)
- [x] **Test:** Verify Dockerfiles build in CI. (@qa-agent)
- [x] **Process:** Document image usage and release steps. (@teamlead)
- [x] **Doc:** Update README with registry instructions. (@frontend-agent)
- [x] **Bugfix:** Update docker-compose to reference images. (@backend-agent)

### Sprint Aug-08-2025
*Start:* 2025-08-08  \
*End:* 2025-08-10  \
*Lead:* Codex Team
- [x] **Bugfix:** Switch WebSocket path to /ws and update frontend. (@backend-agent)
- [x] **Test:** Add WebSocket login flow tests. (@qa-agent)
- [x] **Doc:** Document WebSocket changes in code_issues and testcases. (@doku-agent)

### Sprint Aug-12-2025
*Start:* 2025-08-12  \
*End:* 2025-08-14  \
*Lead:* Codex Team
- [x] **Security:** JWT-Verifizierung beim WebSocket-Handshake. (@backend-agent)
- [x] **Feature:** Speicherung aktiver WS-Verbindungen pro Benutzer. (@backend-agent)
- [x] **Test:** Wiederverbindungs-Test f\u00fcr WebSocketService. (@qa-agent)
- [x] **Doc:** WebSocket-API dokumentiert. (@doku-agent)
- [x] **Config:** Compose-Datei f\u00fcr /ws angepasst. (@teamlead)

### Sprint Aug-15-2025
*Start:* 2025-08-15  \
*End:* 2025-08-17  \
*Lead:* Codex Team
- [x] **Feature:** Gezielt WebSocket-Nachrichten an Benutzer senden. (@backend-agent)
- [x] **Feature:** Tabellen `projects` und `workflows` angelegt. (@backend-agent)
- [x] **Tooling:** CLI zum Exportieren und Löschen von Hive-Logs. (@backend-agent)
- [x] **Test:** Unit-Tests für wsConnections. (@qa-agent)
- [x] **Doc:** Produktionsdeploy-Anleitung im README. (@doku-agent)

### Sprint Aug-22-2025
*Start:* 2025-08-22  \
*End:* 2025-08-24  \
*Lead:* Codex Team
- [x] **Feature:** REST-Endpunkte f\u00fcr Projekte implementiert. (@backend-agent)
- [x] **Feature:** Workflow-Ausf\u00fchrungs-API mit Queue. (@backend-agent)
- [x] **Bugfix:** Hive-Log-API Pagination. (@backend-agent)
- [x] **Doc:** API-Dokumentation erg\u00e4nzt. (@doku-agent)

### Sprint Aug-29-2025
*Start:* 2025-08-29  \
*End:* 2025-08-31  \
*Lead:* Codex Team
- [ ] **Feature:** Worker zur Verarbeitung der Workflow-Queue. (@backend-agent)
- [ ] **Feature:** REST-Endpunkte f\u00fcr Workflow CRUD. (@backend-agent)
- [ ] **Doc:** Queue-Endpunkte dokumentieren. (@doku-agent)

### Sprint 1
*Start:* 2025-09-01  \
*End:* 2025-09-03  \
*Lead:* Codex Team
- [x] **Bugfix:** WebSocket-Handshake unter `/ws` implementieren. (@backend-agent)
- [x] **Test:** WebSocket-Handshake-Tests aktualisieren. (@qa-agent)
- [x] **Doc:** WebSocket-Endpunkt dokumentieren. (@doku-agent)

### Sprint 2 Summary
Removed legacy Gemini WebSocket code and documented new channel-based protocol.
### Sprint 3 Summary
Implemented worker queue and new WebSocket client with heartbeat.
### Sprint 4 Summary
Introduced REST backend with auth proxy and adjusted deployment scripts.
### Sprint 5 Summary
Added role-based authentication with persistent database storage and admin user listing.
### Sprint 7 Summary
Implemented workflow CRUD API and queue worker communicating with MCP.
### Sprint 8 Summary
Implemented secure profile endpoint and updated frontend.
### Sprint 9 Summary
Added migrations with persistent workflows, project API and frontend integration.

### Sprint 12 Summary
Fixed missing workflow_queue table by running migrations automatically on backend startup and in tests.

### Sprint 13 Summary
Implemented workflow queue endpoint with frontend progress view and added integration tests.
### Sprint 14 Summary
Implemented workflow cancellation endpoint with frontend stop button and documented workflow events.
### Sprint 15 Summary
Implemented queue detail endpoint with tests and updated WorkflowQueue UI with cancelled status.
### Sprint 16 Summary
Implemented workflow log endpoint with WebSocket updates and frontend viewer.
