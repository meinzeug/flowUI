# Flow Weaver

Flow Weaver ist eine anspruchsvolle Hybrid-IDE für Claude-Flow. Sie verbindet strategische Projektplanung mit prozeduraler KI-Orchestrierung und überbrückt damit die Distanz zwischen *Was* und *Wie* der Softwareentwicklung.
Alle Projektunterlagen befinden sich gebündelt im Verzeichnis `/codex/data/`.

## Installation auf Ubuntu

### Schnelle Installation

Stelle sicher, dass `curl` oder `wget` vorhanden ist:

```bash
sudo apt update
sudo apt install -y curl   # alternativ: wget
```

Dann genügt ein einziger Befehl, um das Install-Skript direkt auszuführen.

Mit **curl**

```bash
bash -c "$(curl -fsSL https://raw.githubusercontent.com/meinzeug/flowUI/main/install.sh)"
```

oder mit **wget**

```bash
wget -qO- https://raw.githubusercontent.com/meinzeug/flowUI/main/install.sh | bash
```

Das Skript klont das Repository nach `/opt/flowUI`, installiert Docker sowie
NGINX und startet anschließend die Container per `docker compose`. Es benötigt
Root- bzw. **sudo**‑Rechte und schreibt ein Log nach
`~/flowui-install.log`.
Dabei wird auch eine `.env`-Datei mit einem zufälligen `JWT_SECRET` erzeugt.

Hinweis: Ersetze `main` im URL, falls dein Standard-Branch anders heißt (z. B. `master`). Über `-f` bzw. `-q` bricht der Befehl bei HTTP-Fehlern ab.

Möchtest du das Skript zunächst prüfen, lade es lokal herunter:

```bash
curl -fsSL https://raw.githubusercontent.com/meinzeug/flowUI/main/install.sh -o install.sh
less install.sh
bash install.sh
```

### Manuelle Installation

1. Repository klonen und in das Verzeichnis wechseln:
   ```bash
   git clone https://github.com/meinzeug/flowUI.git
   cd flowUI
   ```
2. Installationsskript ausführbar machen und starten (mit Root- oder sudo-Rechten):
   ```bash
   chmod +x install.sh
   ./install.sh
   ```
   Das Skript baut die Docker-Container und startet sie mit `docker compose`.
   Dabei wird eine `.env`-Datei mit einem zufälligen `JWT_SECRET` erzeugt,
   das vom Backend für die Ausgabe von JWT-Tokens benötigt wird. Docker Compose
   liest diese Variable aus `.env` und reicht sie an den Backend-Container
   weiter. Wenn du die Container manuell startest, setze das Environment
   entsprechend.
   Optional kannst du in `frontend/.env.local` eine Variable `VITE_WS_URL`
  definieren, um den WebSocket-Endpunkt explizit festzulegen
  (z. B. `wss://meinzeug.cloud/ws`). Ohne diesen Eintrag wird automatisch
   der Host der aktuell aufgerufenen Seite verwendet.
3. Nach Abschluss ist die Oberfläche unter `http://localhost:8080` erreichbar.

### Update des Systems

Nach der Installation kann Flow Weaver jederzeit mit einem einfachen Befehl auf
den neuesten Stand gebracht werden:

```bash
bash -c "$(curl -fsSL https://raw.githubusercontent.com/meinzeug/flowUI/main/update.sh)"
```

Das Skript aktualisiert das Repository in `/opt/flowUI` und startet die Docker-
Container neu. Wie beim Installationsskript werden erforderliche Root-Rechte
automatisch per `sudo` angefordert.
Falls ein lokaler NGINX-Prozess läuft, stoppt das Skript diesen kurzzeitig,
damit die Container ihre Ports problemlos binden können. Anschließend wird
der Dienst wieder gestartet.
Besitzt die Datei `install.json` einen Domain-Eintrag, passt das Skript zudem die NGINX-Konfiguration im Container an und nutzt das zugehörige Let's-Encrypt-Zertifikat.
Wenn du ein externes NGINX mit eigenem TLS-Zertifikat nutzt, kannst du die HTTPS-Portbindung des Containers entfernen, indem du die Variable `REMOVE_HTTPS_PORT=1` setzt:

```bash
REMOVE_HTTPS_PORT=1 bash update.sh
```

### Kontinuierliche Bereitstellung

Ein GitHub Actions Workflow sorgt dafür, dass nach erfolgreich durchlaufenen
Tests automatisch die neueste Version auf dem Zielserver eingespielt wird. Die
Pipeline triggert das Skript `update.sh` per SSH und hängt das Ergebnis in
`deploy_log.md` an. Für die Verbindung werden die Secrets `DEPLOY_HOST`,
`DEPLOY_USER` und `DEPLOY_SSH_KEY` benötigt.

### Vorgefertigte Docker-Images

Zusätzlich baut ein separater Workflow automatisch Docker-Images und
veröffentlicht sie im GitHub Container Registry. Du kannst die
aktuellen Images direkt ziehen:

```bash
docker pull ghcr.io/meinzeug/flowui-backend:latest
docker pull ghcr.io/meinzeug/flowui-frontend:latest
```

Die Images sind privat und erfordern einen Login am
GitHub Container Registry (GHCR). Hinterlege dafür deinen Benutzernamen
und ein Personal Access Token mit der Berechtigung `read:packages` in den
Variablen `GHCR_USERNAME` und `GHCR_PAT` der `.env` oder gib sie beim
Installationsskript ein. Fehlen diese Angaben, baut das Skript die Docker
Images lokal.

Das bereitgestellte `docker-compose.yml` nutzt bereits die veröffentlichten
Tags. Du kannst sie über `BACKEND_IMAGE` und `FRONTEND_IMAGE`
anpassen und anschließend per

```bash
docker compose pull
docker compose up -d
```

### Produktionsdeployment

Folgende Schritte richten Flow Weaver auf einem frischen Server ein:

1. Installiere alle Abhängigkeiten mit dem bereitgestellten Install-Skript oder
   klone das Repository und führe `./install.sh` aus.
2. Lege in `install.json` deine Domain fest, damit NGINX automatisch ein
   Let's‑Encrypt-Zertifikat beantragt.
3. Starte die Container für den Produktivbetrieb:

   ```bash
   docker compose pull
   docker compose up -d
   ```

4. Aktualisiere das System später mit `update.sh`, welches den Code zieht,
   Container neu baut und NGINX neu lädt.

Die Anwendung ist anschließend unter der konfigurierten Domain beziehungsweise
`http://<server-ip>:8080` erreichbar.

starten.


### Betriebsmodus wechseln

Mit `switch.sh` kannst du jederzeit zwischen Produktions- und Entwicklungsmodus umschalten. Im Entwicklungsmodus werden Frontend und Backend direkt aus dem Quellcode gestartet, was Updates wesentlich beschleunigt.
Das Skript nutzt `lsof`, um zu prüfen, ob die vorgesehenen Ports bereits belegt sind. Installiere es bei Bedarf mit `sudo apt install -y lsof`.

```
./switch.sh d   # Development
./switch.sh p   # Production
bash -c "$(curl -fsSL https://raw.githubusercontent.com/meinzeug/flowUI/main/switch.sh)"  # direkt aus dem Netz
```



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

## Backend-Entwicklung

Der Servercode befindet sich im Verzeichnis `backend`. Wechsel in dieses Verzeichnis, installiere die Abhängigkeiten und starte den Server:

```bash
cd backend
npm install
npm start
```

Der Server lauscht auf Port 3008. Eine Testroute erreichst du über `POST /api/test`.

## Vision

Flow Weaver soll sich zu einer vollwertigen Plattform entwickeln. Geplant sind ein Community-Marktplatz für geteilte Workflows, kollaboratives Arbeiten mit visuellem Diff, Performance-Analysen sowie eine erweiterte Benutzererfahrung mit Undo/Redo und Hilfslinien【F:idee.md†L83-L90】.

## Lizenz

Dieses Projekt steht unter der [MIT-Lizenz](LICENSE).
\nIndex.html befindet sich nun im Projektwurzelverzeichnis.
# Test Commit
