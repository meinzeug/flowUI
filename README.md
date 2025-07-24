# Flow Weaver

Flow Weaver ist eine hybride Entwicklungsumgebung, die auf der Claude-Flow-Architektur basiert. Das Projekt kombiniert strategische Projektplanung mit der prozeduralen Automatisierung von Aufgaben und bildet so eine Brücke zwischen *Was* und *Wie* in der Softwareentwicklung.

## Installation auf Ubuntu

1. Repository klonen und in das Verzeichnis wechseln:
   ```bash
   git clone <REPO-URL>
   cd flowUI
   ```
2. Installationsskript ausführbar machen und starten (Root‑Rechte erforderlich):
   ```bash
   chmod +x install.sh
   ./install.sh
   ```
   Das Skript installiert Docker, das Compose‑Plugin und NGINX, richtet HTTPS über Let's Encrypt ein und startet anschließend die Container.
3. Nach Abschluss ist die Oberfläche unter `https://<deine-domain>` erreichbar.

## Kernidee

Flow Weaver unterstützt zwei Arbeitsmodi von Claude‑Flow:

- **Swarm-Modus** – für temporäre Aufgaben ohne Persistenz. Ein "Quick Task"‑Button öffnet eine zustandslose Arbeitsfläche.
- **Hive‑Mind-Modus** – für langfristige Projekte mit projektweitem Gedächtnis. Strategische Planung erfolgt im *Nexus*-Board, die detaillierte Umsetzung auf dem *Weaver Canvas*.

## Von der Idee zum Code

1. **Mission erstellen** – im Nexus wird eine neue Karte angelegt, z. B. "Implementiere 2FA".
2. **KI‑Blueprint** – per Klick erzeugt die KI einen Vorschlag für einen Workflow und füllt den zugehörigen Canvas automatisch.
3. **Verfeinerung** – Entwickler bearbeiten den Graphen, konfigurieren Parameter im Inspektor‑Panel und hängen Hooks an.
4. **Ausführung** – der Graph wird gesammelt als eine `tools/batch`‑Anfrage an das Backend geschickt und live überwacht.

## Hauptkomponenten

- **WebSocketService** mit Heartbeats und Auto‑Reconnect zur stabilen Kommunikation.
- **Dynamische Werkzeugpalette** durch Aufruf von `tools/list` beim Start.
- **Drag‑and‑Drop Canvas** für MCP‑Tools und Agenten.
- **Inspektor‑Panel** zur Konfiguration ausgewählter Knoten.
- **Konsole** für Logs und Ergebnisse.

## Vision

Langfristig soll Flow Weaver kollaboratives Arbeiten, Versionsvergleiche direkt auf dem Canvas und Performance‑Analysen der Agenten ermöglichen. Eine Community‑Plattform zum Austausch fertiger Workflows ist geplant.

## Lizenz

Dieses Projekt steht unter der [MIT-Lizenz](LICENSE).
