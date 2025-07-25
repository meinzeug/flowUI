## Test Cases

1. **API Authentication Flow**
   - Register new user via `POST /api/auth/register`
   - Login with the same credentials via `POST /api/auth/login`
   - Access protected endpoint `/api/profile` using returned JWT
   - Expect user info in response

2. **Docker Build Validation**
   - Run `docker build` for `backend/Dockerfile`
   - Run `docker build` for root `Dockerfile`
   - Both commands exit with status 0

3. **WebSocket Login Flow**
   - Öffne WebSocket-Verbindung zu `/ws` mit JWT als Query-Parameter
   - Erwartet erfolgreiche Verbindung
   - Verbindungsversuch auf ungültigem Pfad liefert Fehler
   - Verbindungsversuch ohne Token wird abgewiesen
   - Verbindungsversuch mit ungültigem Token wird abgewiesen

4. **WebSocketService Reconnect**
   - Simuliere Schließen der Verbindung im Frontend
   - Erwartet neuen Verbindungsaufbau nach 1 Sekunde

5. **wsConnections Middleware**
   - Erzeuge Mock-WebSocket und speichere Verbindung mit `storeConnection`
   - Erwartet, dass `getConnections` die Verbindung liefert
   - Sende `close`-Event und prüfe, dass sie entfernt wurde


7. **Project API**
   - Erstelle Projekt mit `POST /api/projects` und Token
   - Erwartet Antwort mit Projekt-ID
   - Rufe `GET /api/projects` auf und prüfe, dass das Projekt gelistet wird
8. **Hive-Log Pagination**
   - Erzeuge mehrere Logeinträge via `POST /api/hive/log`
   - Rufe `GET /api/hive/logs?page=2&limit=1` auf
   - Erwartet genau einen Eintrag
9. **Workflow Execution Queue**
   - Füge Workflow in Datenbank ein
   - Sende `POST /api/workflows/:id/execute` mit Token
   - Erwartet Antwort `{ queued: true }`
10. **Queue Worker Broadcast**
   - Rufe `enqueueTask` mit Kanal und Payload auf
   - Starte Worker mit Mock-Broadcast
   - Erwarte, dass nach 1s ein Ergebnis mit `status: done` gesendet wird
