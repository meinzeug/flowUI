# Technische Dokumentation

Diese Datei fasst die wichtigsten Informationen aus den vorhandenen Dokumenten zusammen.

## Backend
Das Backend nutzt ein Microservice-Konzept auf Basis von Spring Boot und PostgreSQL/MongoDB. Ein rollenbasiertes Berechtigungssystem speichert die Rolle im JWT und wird über Middleware geprüft. Migrations laufen automatisiert beim Start.

## API und Endpunkte
Die Dateien in `docs/` beschreiben REST-Endpunkte für Projekte, Workflows und WebSocket-Kommunikation. Die Hive-Log-API liefert Protokolle, während `projects.md` und `workflows.md` die CRUD-Routen erklären.

## Frontend
`frontend/docs.md` erläutert die Struktur der React-Komponenten. `App.tsx` verwaltet den globalen Zustand und kommuniziert mit den KI-Diensten. Tailwind CSS bildet das Design-System.
