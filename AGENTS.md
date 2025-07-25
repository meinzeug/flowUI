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
