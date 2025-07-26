## Nächste Aufgaben (Sprint 17)
1. Endpoint zum Löschen der Workflow-Logs implementieren (`POST /api/workflows/queue/:id/logs/clear`) und testen.
2. Log-API um Paginierung erweitern und Frontend-Komponente entsprechend anpassen.
3. Eine Workflow-History-Ansicht im Frontend erstellen, welche abgeschlossene Runs mit Status und Logdownload anzeigt.

### Authentifizierungs-Update
Der globale `fetch`-Wrapper liest den JWT nun bei jedem Aufruf aus
`localStorage` und fügt ihn automatisch als `Authorization`-Header ein.

### Build-Strategie
Container-Images werden **nicht** mehr von GHCR oder anderen Registries
gezogen. `update.sh` baut stets die lokalen `Dockerfile`s neu und startet die
Container mit `docker compose up -d --build`. Es soll kein CI-gesteuerter
Image-Pull stattfinden.
