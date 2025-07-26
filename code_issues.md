# Code Issues

- Only minimal automated tests exist for frontend and backend.
- Grundlegende Datenbanktabellen vorhanden, MCP-Spezifikation teilweise umgesetzt.
- Frontend tests initially executed node_modules due to missing Vitest config (fixed).
- No automated workflow to publish Docker images. **(resolved)**

- `frontend/docs.md` enthält keine Beschreibung der WebSocket-Nutzung. Login und Tool-Listen verwenden jedoch `WebSocketService`, wodurch eine fehlende Dokumentation zu Verbindungsfehlern wie 404-Handshakes führt. **(resolved)**
- Migrations werden jetzt automatisch beim Start ausgeführt, Tabellen sind somit stets vorhanden.
- Hive-Log-API lieferte immer nur die letzten 50 Einträge ohne Pagination. **(resolved)**
- Database migrations were split across services causing startup failure. Unified directories fixed this.
