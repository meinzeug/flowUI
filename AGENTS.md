## Nächste Aufgaben (Sprint 16)
1. Workflow-Queue um Log-Ausgabe erweitern: Backend-Endpunkt `/api/workflows/queue/:id/logs` implementieren und testen.
2. WebSocket-Benachrichtigungen für Workflow-Fortschritt und Abschluss ausbauen und im Frontend live anzeigen.
3. Dokumentation der neuen Log-API und WebSocket-Events in `docs/workflows.md` und `frontend/docs.md` ergänzen.

### Authentifizierungs-Update
Der globale `fetch`-Wrapper liest den JWT nun bei jedem Aufruf aus
`localStorage` und fügt ihn automatisch als `Authorization`-Header ein.
