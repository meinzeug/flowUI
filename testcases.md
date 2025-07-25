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

6. **Hive-Log-Export-Skript**
   - Führe `node scripts/exportLogs.js logs.json` aus
   - Erwartet Datei `logs.json` mit Log-Einträgen
   - Tabelle `activity_log` wird danach geleert
