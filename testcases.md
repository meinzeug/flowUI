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
