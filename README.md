# Flow Weaver

Flow Weaver ist eine anspruchsvolle Hybrid-IDE für Claude-Flow. Sie verbindet strategische Projektplanung mit prozeduraler KI-Orchestrierung und überbrückt damit die Distanz zwischen *Was* und *Wie* der Softwareentwicklung.

## Installation auf Ubuntu

1. Repository klonen und in das Verzeichnis wechseln:
   ```bash
   git clone <REPO-URL>
   cd flowUI
   ```
2. Installationsskript ausführbar machen und starten (Root-Rechte erforderlich):
   ```bash
   chmod +x install.sh
   ./install.sh
   ```
   Das Skript installiert Docker, das Compose-Plugin und NGINX, richtet HTTPS über Let's Encrypt ein und startet anschließend die Container.
3. Nach Abschluss ist die Oberfläche unter `https://<deine-domain>` erreichbar.

## Kernidee: Zwei Betriebsmodi

Flow Weaver unterstützt sowohl kurzfristige als auch langfristige Workflows und fasst beide Ansätze in einer einheitlichen Bedienoberfläche zusammen:

- **Swarm-Modus** – ein "Quick Task"-Button öffnet eine temporäre Arbeitsfläche für schnelle, einmalige Aufgaben ohne persistentes Gedächtnis.
- **Hive-Mind-Modus** – strategische Planung im **Nexus**-Board und detaillierte Ausführung auf dem **Weaver Canvas** bilden den Kern langlebiger Projekte.

Diese Aufteilung folgt der in `idee.md` beschriebenen Kernphilosophie, bei der Swarm und Hive-Mind kombiniert werden, um sowohl spontane als auch umfangreiche Vorhaben effizient abzubilden【F:idee.md†L10-L26】.

## Von der Idee zum Code

Der gesamte Entwicklungszyklus ist eng verzahnt und nutzt KI-Unterstützung:

1. **Missionserstellung** – im Nexus wird eine neue Karte angelegt, z.B. "Implementiere ein 2FA-System".
2. **KI-Blueprinting** – ein "Blueprint"-Button analysiert die Mission, erstellt einen ersten Workflow und füllt den dazugehörigen Canvas automatisch mit `ToolNode`s.
3. **Verfeinerung** – der erzeugte Graph lässt sich erweitern, Parameter werden im Inspektor-Panel angepasst und optionale Hooks können eingebunden werden.
4. **Ausführung & Live-Monitoring** – alle Tool-Aufrufe werden gesammelt als einzige `tools/batch`-Anfrage an das Backend gesendet. Währenddessen zeigt der Canvas Statusfarben, animierte Kanten und eine Log-Konsole an, um den Fortschritt zu verfolgen.

Diese Schritte sind in `idee.md` im Abschnitt "Der integrierte Workflow" beschrieben【F:idee.md†L30-L44】.

## Architektur und Komponenten

Das Frontend basiert auf React, TypeScript und React Flow und setzt eine defensive Kommunikation zum Backend ein. Wichtige Merkmale sind:

- **WebSocketService** mit Heartbeats und Auto-Reconnect, der die gesamte JSON-RPC-Kommunikation kapselt【F:idee.md†L46-L51】.
 - **Dynamische Werkzeugpalette**: Beim Start ruft die UI `tools/list` über die WebSocket-Schnittstelle auf, um alle verfügbaren Tools samt Parametern zu laden【F:idee.md†L50-L51】.
- **Drag-and-Drop Canvas**, Werkzeugpalette, Inspektor-Panel und Protokollkonsole bilden die wesentlichen UI-Komponenten【F:idee.md†L52-L57】.
- **Globales Zustandsmanagement** verwaltet Verbindungsstatus, Agenteninformationen und Workflow-Daten【F:idee.md†L58-L62】.
- Die Kernlogik befindet sich in `App.tsx`, das den globalen Zustand und die Kommunikation mit den KI-Diensten koordiniert【F:frontend/docs.md†L11-L20】.
- Das Styling nutzt Tailwind CSS mit einer futuristischen Farbpalette und festen Design-Tokens【F:frontend/docs.md†L299-L315】.

## Vision

Flow Weaver soll sich zu einer vollwertigen Plattform entwickeln. Geplant sind ein Community-Marktplatz für geteilte Workflows, kollaboratives Arbeiten mit visuellem Diff, Performance-Analysen sowie eine erweiterte Benutzererfahrung mit Undo/Redo und Hilfslinien【F:idee.md†L83-L90】.

## Lizenz

Dieses Projekt steht unter der [MIT-Lizenz](LICENSE).
