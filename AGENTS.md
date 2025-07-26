## Nächste Aufgaben (Sprint 16)
1. Workflow-Queue um Log-Ausgabe erweitern: Backend-Endpunkt `/api/workflows/queue/:id/logs` implementieren und testen.
2. WebSocket-Benachrichtigungen für Workflow-Fortschritt und Abschluss ausbauen und im Frontend live anzeigen.
3. Dokumentation der neuen Log-API und WebSocket-Events in `docs/workflows.md` und `frontend/docs.md` ergänzen.


### Authentifizierungs-Update
Der globale `fetch`-Wrapper liest den JWT nun bei jedem Aufruf aus
`localStorage` und fügt ihn automatisch als `Authorization`-Header ein.

### Build-Strategie
Container-Images werden **nicht** mehr von GHCR oder anderen Registries
gezogen. `update.sh` baut stets die lokalen `Dockerfile`s neu und startet die
Container mit `docker compose up -d --build`. Es soll kein CI-gesteuerter
Image-Pull stattfinden.
