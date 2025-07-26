# MCP Backend

Dieses Verzeichnis enthält den Message Control Point (MCP) Service und die dazugehörigen Datenbank-Migrationen.

## Migrationen ausführen

Installiere Abhängigkeiten und führe anschließend die Migrationen aus:

```bash
npm install
npx knex --knexfile knexfile.cjs migrate:latest
```

Alle Migrationen sind idempotent und können gefahrlos erneut ausgeführt werden.

### Tabellenübersicht

- **users** – Benutzerkonten mit `role`
- **projects** – Zuordnungen von Benutzern zu Projekten
- **workflows** – Persistierte Workflows eines Projekts
- **workflow_queue** – Warteschlange für Workflow-Ausführungen

Weitere Tabellen wie `memory_entries` oder `training_metrics` sind in älteren Migrationen enthalten.
