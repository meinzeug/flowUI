# Langfristige Ideen und Notizen
- WebSocket-Verbindungen sollen später gezielt pro Benutzer für Tool-Statusmeldungen genutzt werden.
- Projekte- und Workflow-Tabellen existieren; nächster Schritt ist eine Queue für Workflow-Ausführungen.
- Automatische Deployment-Pipeline zu einem Cloud-Anbieter geplant.
- Migrations werden aktuell per SQL in initDb erstellt. Langfristig sollte ein dediziertes Tool wie Knex eingesetzt werden.
- Backend roles implemented with users.role column
 
- Workflow queue worker implemented using WebSocket to MCP.
Added secure /profile endpoint using JWT middleware to provide user info.
- Sprint9: migrations for users/projects/workflows; workflows persisted

- Sprint13: unified migrations across backend and mcp; added queue listing endpoint and frontend view.
