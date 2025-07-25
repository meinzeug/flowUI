- Publish Docker images for backend and frontend.
- Add GitHub Actions workflow to build and push Docker images to GHCR.
- Document usage of the published images in README.md.
- Update deployment process to use prebuilt images by default.
- Create tests ensuring Dockerfiles build successfully.
- Document Docker image workflow in milestones and todo lists.

## Nächste Aufgaben (Sprint Aug-08-2025)

[P1] Analysiere `frontend/docs.md`, um alle UI-Funktionen zu identifizieren, die WebSocket-Verbindungen nutzen (insbesondere Login), und dokumentiere den aktuellen Stand in `code_issues.md`.

[P1] Implementiere einen funktionierenden WebSocket-Server im Backend (z. B. über `ws` oder `socket.io`), der auf einem dedizierten Pfad wie `/ws` oder `/socket` lauscht und Authentifizierungsereignisse verarbeitet.

[P1] Behebe den WebSocket-Fehler: `WebSocket connection to 'wss://meinzeug.cloud/api/' failed: Error during WebSocket handshake: Unexpected response code: 404`. Stelle sicher, dass das Backend korrekt auf den gewünschten Pfad antwortet und der Handshake funktioniert.

[P2] Passe die WebSocket-URL im Frontend an (z. B. auf `wss://meinzeug.cloud/ws`) und stelle sicher, dass die Verbindung vom UI zum Backend erfolgreich hergestellt wird.

[P2] Entwickle Integrationstests für den vollständigen WebSocket-basierten Login-Flow (Verbindung, Authentifizierung, Fehlerfälle). Dokumentiere den Ablauf in `testcases.md`.

## Nächste Aufgaben (Sprint Aug-12-2025)
1. [P1] Implementiere JWT-Verifizierung beim WebSocket-Handshake und weise Verbindungen ohne Token ab.
2. [P1] Schreibe Middleware zum Speichern der aktiven WebSocket-Verbindungen nach Benutzer-ID.
3. [P2] Ergänze Wiederverbindungs-Tests für `WebSocketService` im Frontend.
4. [P2] Dokumentiere das neue `/ws`-API in `backend.md`.
5. [P3] Aktualisiere `docker-compose.yml`, um den Pfad `/ws` auch im Reverse Proxy bereitzustellen.
