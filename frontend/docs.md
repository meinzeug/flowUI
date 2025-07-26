# Claude-Flow GUI: Funktions- und Schnittstellendokumentation

Dieses Dokument beschreibt die technische Architektur, die Komponenten, die API-Verträge und die Design-System-Grundlagen der Claude-Flow GUI. Es richtet sich an Backend-Entwickler, die die erforderlichen Dienste und Endpunkte implementieren müssen.

## 1. Komponenten

Dieser Abschnitt beschreibt die wichtigsten wiederverwendbaren und Ansichts-Komponenten der Anwendung.

---

### 1.1. `App.tsx`

- **Name & Pfad:** `App` (`/App.tsx`)
- **Beschreibung:** Die Wurzelkomponente der Anwendung. Sie verwaltet den globalen Zustand, einschließlich des aktiven Projekts, der aktuellen Ansicht, der Modalfenster und der Chat-Verläufe. Sie enthält die Kernlogik für die Verarbeitung von Benutzeraktionen und die Kommunikation mit den KI-Diensten.
- **Props:** Keine
- **State / lokale Variablen:**
  - `projects`: `Project[]` - Liste aller verfügbaren Projekte.
  - `activeProject`: `Project | null` - Das aktuell ausgewählte Projekt.
  - `currentView`: `View` - Die aktuell angezeigte Ansicht (z.B. 'dashboard', 'nexus-roadmap').
  - `activityLog`: `ActivityLogEntry[]` - Protokoll für die Aktivitätskonsole.
  - `isSpawnModalOpen`, `isInitiateModalOpen`, etc.: `boolean` - Zustände zur Steuerung der Sichtbarkeit von Modals.
  - `toasts`: `Toast[]` - Liste der aktiven Toast-Benachrichtigungen.
  - `assistantStatus`, `hodStatus`: `AssistantStatus` - Zustand der KI-Assistenten ('idle', 'thinking', etc.).
  - `chatHistory`, `hodChatHistory`: `ChatMessage[]` - Nachrichtenverläufe für die KI-Assistenten.
  - `hodQueryContext`: `HoDQueryContext | null` - Kontext für die modale Abfrage des "Head of Development".
- **Funktionen (Methoden):**
| Funktion | Parameter | Beschreibung |
|---|---|---|
| `addToast` | `message: string`, `type: Toast['type']` | Zeigt eine temporäre Toast-Benachrichtigung am oberen rechten Bildschirmrand an. |
| `addLog` | `message: string`, `type: ActivityLogEntry['type']`, `showToast?: boolean` | Fügt einen Eintrag zum Aktivitätsprotokoll in der Konsole am unteren Bildschirmrand hinzu. Kann optional auch einen Toast auslösen. |
| `addChatMessage` | `message: Omit<ChatMessage, 'id'>` | Fügt eine Nachricht zum Chat-Verlauf des Standard-KI-Assistenten hinzu. |
| `addHodChatMessage` | `message: Omit<ChatMessage, 'id'>` | Fügt eine Nachricht zum Chat-Verlauf des AI Head of Development (HoD) hinzu. |
| `handleSelectProject` | `projectId: string` | Wählt ein Projekt aus der Liste aus, setzt es als `activeProject` und wechselt zur Dashboard-Ansicht. |
| `handleCreateProject` | `name: string`, `description: string`, `template: Project['template']` | Erstellt ein neues Projekt basierend auf einer Vorlage und setzt es als aktives Projekt. |
| `handleInitiateAutonomousProject` | `name: string`, `description: string`, `roadmap: RoadmapMission[]`, `team: StrikeTeam` | Startet ein neues autonomes Projekt, generiert Missionen, Hives und Agenten und setzt es als aktives Projekt. |
| `handleExitProject` | - | Setzt das aktive Projekt zurück auf `null`, was zur Projektauswahlansicht zurückkehrt. |
| `handleSpawnHive` | `name: string`, `namespace: string`, `agents: AgentType[]`, `isTemporary: boolean` | Erstellt eine neue Hive-Mind-Sitzung und die zugehörigen DAA-Agenten im aktiven Projekt. |
| `handleCreateAgent` | `agent: Omit<DAAgent, 'id'>` | Erstellt manuell einen einzelnen, spezialisierten Dynamic Agent im aktiven Projekt. |
| `handleStartConsensus` | `topic: string` | Startet ein neues Konsens-Thema für die DAA-Agenten zur Abstimmung. |
| `handleRunSwarm` | `task: string`, `continueSessionId?: string` | Führt eine schnelle, temporäre Aufgabe mit einem Schwarm aus. Kann optional den Kontext einer bestehenden Hive-Sitzung nutzen. |
| `handleStoreMemory` | `entry: Omit<MemoryEntry, 'id' | 'timestamp'>` | Speichert manuell einen neuen Eintrag in der Vektordatenbank (Memory) des Projekts. |
| `handleUpdateHive` | `hiveId: string`, `updates: Partial<Hive>` | Aktualisiert die Eigenschaften (z.B. Name, Status) einer bestehenden Hive-Sitzung. |
| `handleDestroyHive` | `hiveId: string` | Entfernt eine Hive-Sitzung und setzt die zugehörigen Agenten in den Leerlauf (Idle). |
| `handleUpdateIntegration` | `integrationId: string`, `newStatus: 'Connected' \| 'Disconnected'` | Ändert den Verbindungsstatus einer externen Integration (z.B. GitHub, Google Drive). |
| `handleUpdateApiKeys` | `updatedApiKeys: ApiKeyEntry[]` | Speichert die aktualisierten API-Schlüssel-Konfigurationen im Projektzustand. |
| `handleUpdateAssistantSettings` | `newSettings: AssistantSettings` | Speichert die aktualisierten Einstellungen für den KI-Assistenten im Projektzustand. |
| `handleCreateWorkflow` | `workflowData: Omit<Workflow, 'id' | 'lastRun'>` | Fügt einen neuen, benutzerdefinierten Workflow zum Projekt hinzu. |
| `handleUpdateMission` | `missionId: string`, `updates: Partial<Mission>` | Aktualisiert die Eigenschaften (z.B. Status, Unteraufgaben) einer Mission auf der Roadmap. |
| `handleMissionAction` | `missionId: string`, `action: string` | Simuliert die Ausführung einer Aktion für eine bestimmte Mission (primär für Logging). |
| `handleQueenCommand` | `command: string` | Verarbeitet eine hochrangige Anweisung an einen Queen-Agenten, die normalerweise zur Erstellung einer neuen Mission führt. |
| `handleAssistantAction` | `action: AssistantAction` | Verarbeitet das strukturierte JSON-Objekt, das von der KI als Antwort auf einen Befehl kommt, und führt die entsprechende Zustandsänderung in der App durch. |
| `handleProcessCommand` | `command: string` | Die Hauptfunktion, die eine Benutzereingabe (Text oder Sprache) an den KI-Assistenten-Service sendet, um sie in eine `AssistantAction` umzuwandeln. |
| `handleProcessHoDCommand` | `command: string` | Die Hauptfunktion, die eine Direktive des CTO an den AI Head of Development (HoD) sendet, um einen detaillierten Bericht zu erhalten. |
| `handleOpenHodQueryModal` | `context: HoDQueryContext` | Öffnet das modale Dialogfenster, um dem HoD eine spezifische Frage zu einem Element (Mission, Agent etc.) zu stellen. |
| `handleProcessHodContextualQuery` | `query: string` | Sendet die spezifische Frage aus dem `HoDQueryModal` zusammen mit dem Kontext an den HoD-Service. |
| `renderView` | - | Eine interne Hilfsfunktion, die basierend auf dem `currentView`-Zustand die entsprechende Ansichtskomponente zur Anzeige auswählt. |
- **Beispielcode (vereinfacht):**
  ```jsx
  // In index.tsx
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  ```

---

### 1.2. `ProjectSelector.tsx`

- **Name & Pfad:** `ProjectSelector` (`/components/views/ProjectSelector.tsx`)
- **Beschreibung:** Dies ist die erste Ansicht, die ein Benutzer sieht, wenn kein aktives Projekt ausgewählt ist. Sie zeigt eine Liste bestehender Projekte an und ermöglicht die Erstellung eines neuen Projekts über ein modales Fenster.
- **Props:**
| Name | Typ | Beschreibung |
|---|---|---|
| `projects` | `Project[]` | Eine Liste der vorhandenen Projekte, die angezeigt werden sollen. |
| `onSelectProject` | `(projectId: string) => void` | Callback, der aufgerufen wird, wenn ein Benutzer auf eine Projektkarte klickt. |
| `onCreateProject` | `(name, desc, template) => void` | Callback, der aufgerufen wird, wenn das Formular zur Projekterstellung abgeschickt wird. |
- **State / lokale Variablen:**
  - `isModalOpen`: `boolean` - Steuert die Sichtbarkeit des Modals zur Projekterstellung.
  - `newProjectName`, `newProjectDesc`, `selectedTemplate`: `string` - Halten die Werte aus den Eingabefeldern des Modals.
- **Funktionen (Methoden):**
| Funktion | Parameter | Beschreibung |
|---|---|---|
| `handleCreate` | - | Validiert die Eingabe des Projektnamens und ruft den `onCreateProject`-Callback mit den Formulardaten auf. Schließt anschließend das Modal. |

---

### 1.3. `ProjectList.tsx`

- **Name & Pfad:** `ProjectList` (`/components/ProjectList.tsx`)
- **Beschreibung:** Zeigt eine Liste von Projekten als Karten an.
- **Props:**
| Name | Typ | Beschreibung |
|---|---|---|
| `projects` | `Project[]` | Anzuzeigende Projekte |
| `onSelect` | `(id: string) => void` | Klick-Handler für Projektkarten |

### 1.4. `ProjectCreateModal.tsx`

- **Name & Pfad:** `ProjectCreateModal` (`/components/ProjectCreateModal.tsx`)
- **Beschreibung:** Modal zur Erstellung eines Projekts.
- **Props:**
| Name | Typ | Beschreibung |
|---|---|---|
| `isOpen` | `boolean` | Steuert Sichtbarkeit |
| `onCreate` | `(name: string, desc: string, template: string) => void` | Callback zum Anlegen |
| `onClose` | `() => void` | Schließt das Modal |

---

### 1.5. `Assistant.tsx`

- **Name & Pfad:** `Assistant` (`/components/Assistant.tsx`)
- **Beschreibung:** Die schwebende KI-Assistenten-Komponente, die sich unten rechts befindet. Sie verwaltet die Chat-UI, die Benutzereingabe (Text und Sprache) und den Zustand des Assistenten. Nutzt die Web Speech API für die Spracheingabe.
- **Props:**
| Name               | Typ                             | Beschreibung                                                |
|--------------------|---------------------------------|-------------------------------------------------------------|
| `status`           | `AssistantStatus`               | Der aktuelle Zustand des Assistenten ('idle', 'thinking').    |
| `chatHistory`      | `ChatMessage[]`                 | Array der bisherigen Chat-Nachrichten.                        |
| `onProcessCommand` | `(command: string) => void`     | Callback, der aufgerufen wird, wenn ein Befehl gesendet wird. |
| `language`         | `string`                        | Die Sprache für die Spracherkennung (z.B. 'de-DE').         |
| `onOpenSettings`   | `() => void`                    | Callback zum Öffnen der Assistenten-Einstellungen.          |
| `isEnabled`        | `boolean`                       | Schaltet die Komponente ein oder aus.                       |
- **State / lokale Variablen:**
  - `isOpen`: `boolean` - Steuert, ob das Chat-Fenster geöffnet ist.
  - `isListening`: `boolean` - Zeigt an, ob die Spracherkennung aktiv ist.
  - `userInput`: `string` - Der Text im Eingabefeld.
  - `recognitionRef`: `useRef<SpeechRecognition | null>` - Referenz auf das Web Speech API-Objekt.
- **Funktionen (Methoden):**
| Funktion | Parameter | Beschreibung |
|---|---|---|
| `useEffect` (für `chatHistory`) | `chatHistory` | Scrollt das Chatfenster nach unten, wenn eine neue Nachricht hinzugefügt wird. |
| `useEffect` (für `SpeechRecognitionAPI`) | - | Initialisiert das `SpeechRecognition` Objekt, wenn die Komponente geladen wird. |
| `useEffect` (für `onProcessCommand`) | `onProcessCommand` | Fügt Event-Listener für die Spracherkennung hinzu (`result`, `start`, `end`, `error`). |
| `handleMicClick` | - | Startet oder stoppt die Spracherkennung über die Web Speech API. Verarbeitet auch Berechtigungsfehler. |
| `handleSend` | - | Sendet den Text aus dem `userInput`-Feld über den `onProcessCommand`-Callback an die `App`-Komponente. |

---

### 1.4. `NexusView.tsx`

- **Name & Pfad:** `NexusView` (`/components/views/NexusView.tsx`)
- **Beschreibung:** Stellt die Projekt-Roadmap als Kanban-Board dar. Missionen werden in Spalten angezeigt, die ihrem Status entsprechen ('Backlog', 'In Progress', etc.). Simuliert auch den Arbeitsfortschritt von Agenten.
- **Props:**
| Name | Typ | Beschreibung |
|---|---|---|
| `project` | `Project` | Das aktive Projektobjekt. |
| `addLog` | `(message: string, type?: ...)` | Funktion zum Hinzufügen von Einträgen zum Aktivitätsprotokoll. |
| `onUpdateMission` | `(id, updates) => void` | Callback zur Aktualisierung einer Mission. |
| `onQueenCommand` | `(cmd) => void` | Callback zum Senden eines Befehls an die Queen-Konsole. |
| `onQueryHoD` | `(context) => void` | Callback zum Öffnen des HoD-Abfrage-Modals. |
- **Funktionen (Methoden):**
| Funktion | Parameter | Beschreibung |
|---|---|---|
| `useEffect` (für Agentenarbeit) | `project.roadmap`, `onUpdateMission`, `addLog` | Ein `useEffect`-Hook simuliert den Fortschritt von Agenten, indem er in regelmäßigen Abständen den Status von Unteraufgaben in "In Progress"-Missionen aktualisiert und dies im Log vermerkt. |
| `handleSubTaskToggle` (in `MissionCard`) | `taskId: string` | Schaltet den Status einer Unteraufgabe zwischen `pending` und `complete` um. |
| `handleMoveToNextStage` (in `MissionCard`) | - | Bewegt eine Mission in die nächste Spalte des Kanban-Boards. |
| `handleSubmit` (in `QueenConsole`) | - | Verarbeitet die Eingabe aus der Queen's Console und leitet sie über den `onQueenCommand`-Callback weiter. |

---

### 1.5. Sonstige Komponenten

#### `/components/UI.tsx`
- **`Card`**: Eine wiederverwendbare Kartenkomponente mit Standard-Styling (Hintergrund, Rahmen, Schatten).
- **`Button`**: Eine flexible Button-Komponente mit Varianten ('primary', 'secondary', 'ghost').
- **`Modal`**: Eine generische modale Dialogkomponente, die über `isOpen` gesteuert wird.
- **`Loader`**: Eine Ladeanimation, die für asynchrone Vorgänge verwendet wird.
- **`ToggleSwitch`**: Ein einfacher Schalter zum Ein- und Ausschalten von Optionen.

#### `/components/Header.tsx`
- **Beschreibung:** Die Kopfzeile der Anwendung, die den Projektnamen, eine Suchleiste (zum Öffnen der Befehlspalette) und Benutzeraktionen anzeigt.
- **Funktionen:** Löst Callbacks (`onOpenCommandPalette`, `onOpenSettings`) aus, die von `App.tsx` übergeben werden.

#### `/components/Sidebar.tsx`
- **Beschreibung:** Die linke Navigationsleiste. Ermöglicht den Wechsel zwischen den verschiedenen Ansichten (`View`) der Anwendung.
- **Funktionen:** Verwaltet den aufklappbaren Zustand des "Nexus"-Menüpunkts. Ruft `setCurrentView` und `onExitProject` auf.

#### `/components/CommandPalette.tsx`
- **Beschreibung:** Ein über `Cmd/Ctrl + K` aufrufbares Fenster, das eine schnelle Suche und Ausführung von Befehlen ermöglicht.
- **Funktionen:** Ein `useEffect`-Hook fängt Tastatureingaben ab, um die Navigation (`ArrowUp`/`ArrowDown`), Ausführung (`Enter`) und das Schließen (`Escape`) der Palette zu steuern.

#### `/components/views/DAAView.tsx`
- **Beschreibung:** Visualisiert die "Dynamic Agent Architecture", zeigt alle Agenten als Karten an und ermöglicht deren Verwaltung.
- **Funktionen:**
  - `handleAgentAction`: Simuliert Aktionen wie "Scale Up" oder "Terminate" für einen Agenten.
  - `handleOpenMessageModal`: Öffnet das Modal zum Senden einer Nachricht von einem bestimmten Agenten.
  - `handleSendMessage`: Simuliert den Nachrichtenversand zwischen zwei Agenten.
  - `handleMatchCapabilities`: Findet Agenten, die über bestimmte Fähigkeiten verfügen, und hebt ihre Karten hervor.

#### `/components/views/AIHeadOfDevelopmentView.tsx`
- **Beschreibung:** Bietet ein Chat-Interface zur Interaktion mit der "AI Head of Development"-Persönlichkeit.
- **Funktionen:** `handleSendDirective` sendet eine Benutzereingabe (Direktive) zur Verarbeitung an `App.tsx`.

#### `/components/views/MemoryView.tsx`
- **Beschreibung:** Zeigt gespeicherte Memory-Einträge an und bietet Funktionen zum Suchen und Analysieren der Datenbank.
- **Besonderheit:** Das Suchfeld schlägt während der Eingabe passende Queries aus vorhandenen Einträgen vor. Ein Klick auf einen Vorschlag übernimmt ihn in die Suche.

---

## 2. Hooks

Das Projekt verwendet hauptsächlich die Standard-Hooks von React (`useState`, `useEffect`, `useMemo`, `useRef`). Es werden keine benutzerdefinierten, wiederverwendbaren Hooks (z.B. `useProjectState`) definiert. Die gesamte Zustandslogik ist zentral in der `App.tsx`-Komponente gekapselt.

---

## 3. Services & API-Contracts

Die Anwendung kommuniziert mit der Gemini API über das `@google/genai` SDK. Die Interaktionen sind als "Services" zu verstehen, die spezifische KI-gesteuerte Aufgaben ausführen. Jeder Dienst wird durch einen Aufruf von `ai.models.generateContent` mit einer spezifischen Konfiguration (Systemanweisung und Antwortschema) definiert.

### 3.1. AI Assistant Command Processing

- **Beschreibung des Datenflusses:** Der Benutzer gibt einen Befehl in das Chat-Fenster des Assistenten ein. Die `handleProcessCommand`-Funktion in `App.tsx` wird aufgerufen. Diese Funktion sendet den Befehl zusammen mit einer Systemanweisung und einem Antwortschema an die Gemini API. Die API antwortet mit einem JSON-Objekt, das eine Aktion und Parameter enthält. Die `handleAssistantAction`-Funktion verarbeitet dieses JSON, um den Anwendungszustand zu ändern (z.B. zu einer anderen Ansicht navigieren oder eine neue Mission erstellen).
- **Endpoint & HTTP-Methode:** `ai.models.generateContent` (entspricht einem `POST`-Request).
- **Request-Schema (`config`-Objekt):**
  ```json
  {
    "model": "gemini-2.5-flash",
    "contents": "<Benutzereingabe als String>",
    "config": {
      "systemInstruction": "You are an integrated AI assistant for a development orchestration platform... (siehe constants.ts für den vollständigen Prompt)",
      "responseMimeType": "application/json",
      "responseSchema": {
        "type": "OBJECT",
        "properties": {
          "action": {
            "type": "STRING",
            "enum": ["CREATE_MISSION_WITH_TEAM", "NAVIGATE", "SPAWN_HIVE", "UNKNOWN"]
          },
          "parameters": {
            "type": "OBJECT",
            "properties": {
              "featureName": { "type": "STRING" },
              "teamSize": { "type": "STRING" },
              "viewName": { "type": "STRING" },
              "hiveName": { "type": "STRING" }
            }
          },
          "feedback": { "type": "STRING" },
          "suggestions": {
            "type": "ARRAY",
            "items": {
              "type": "OBJECT",
              "properties": {
                "text": { "type": "STRING" },
                "command": { "type": "STRING" }
              },
              "required": ["text", "command"]
            }
          }
        },
        "required": ["action", "parameters", "feedback"]
      }
    }
  }
  ```
- **Response-Schema:** Das von der API zurückgegebene JSON muss dem oben definierten `responseSchema` entsprechen.

### 3.2. AI Head of Development (HoD) Briefing

- **Beschreibung des Datenflusses:** Der Benutzer (als CTO) gibt eine Anweisung in das HoD-Briefing-Terminal ein. Die `handleProcessHoDCommand`-Funktion sendet diese Anweisung zusammen mit dem gesamten Projektkontext (als JSON-String) an die Gemini API. Die KI analysiert den Zustand und die Anweisung und generiert einen detaillierten Bericht im Markdown-Format sowie Vorschläge für Folgeanweisungen.
- **Endpoint & HTTP-Methode:** `ai.models.generateContent` (entspricht einem `POST`-Request).
- **Request-Schema (`config`-Objekt):**
  ```json
  {
    "model": "gemini-2.5-flash",
    "contents": "Here is the current project state in JSON: <Projekt-JSON>. The CTO's directive is: \"<Benutzereingabe>\"",
    "config": {
      "systemInstruction": "You are the AI Head of Development (HoD) for the Claude-Flow platform... (siehe constants.ts für den vollständigen Prompt)",
      "responseMimeType": "application/json",
      "responseSchema": {
        "type": "OBJECT",
        "properties": {
          "report": {
            "type": "STRING",
            "description": "A detailed report in Markdown format..."
          },
          "suggestedDirectives": {
            "type": "ARRAY",
            "items": { "type": "STRING" }
          }
        },
        "required": ["report"]
      }
    }
  }
  ```
- **Response-Schema:** Entspricht dem `responseSchema` im Request.

### 3.3. AI Autonomous Roadmap Generation

- **Beschreibung des Datenflusses:** Im "Initiate Project"-Modal gibt der Benutzer eine App-Idee ein. Die `handleGenerateRoadmap`-Funktion sendet diese Beschreibung an die Gemini API, um eine Roadmap mit 5-7 Features zu generieren.
- **Endpoint & HTTP-Methode:** `ai.models.generateContent` (entspricht einem `POST`-Request).
- **Request-Schema (`config`-Objekt):**
  ```json
  {
    "model": "gemini-2.5-flash",
    "contents": "Based on this app idea, generate a high-level project roadmap. App idea: \"<Benutzereingabe>\"",
    "config": {
      "responseMimeType": "application/json",
      "responseSchema": {
        "type": "OBJECT",
        "properties": {
          "roadmap": {
            "type": "ARRAY",
            "items": {
              "type": "OBJECT",
              "properties": {
                "title": { "type": "STRING" },
                "description": { "type": "STRING" }
              },
              "required": ["title", "description"]
            }
          }
        },
        "required": ["roadmap"]
      }
    }
  }
  ```
- **Response-Schema:** Entspricht dem `responseSchema` im Request.

### 3.4. Benutzerverwaltung

- `GET /api/users` – Gibt eine Liste aller Benutzer zurück. Erfordert ein JWT mit der Rolle `admin`.
  Beispiel:
  ```json
  [{"id":1,"username":"admin","email":"admin@example.com","role":"admin"}]
  ```

---

## 4. Styles & Design Tokens

Das Styling wird durch eine Kombination aus [Tailwind CSS](https://tailwindcss.com/) und einem globalen Stylesheet in `index.html` im Projektwurzelverzeichnis realisiert.

### 4.1. Farben

Die Farbpalette ist futuristisch und dunkel, mit Akzenten in Cyan und Magenta.

| Name | Hex-Code | Tailwind-Äquivalent | Beschreibung |
|---|---|---|---|
| `Primary Background` | `#050608` | `bg-[#050608]` | Haupt-Hintergrundfarbe der App. |
| `Primary Text` | `#E0E0E0` | `text-[#E0E0E0]` | Standard-Textfarbe. |
| `Muted Text` | `#94a3b8` | `text-slate-400` | Für sekundären Text und Beschreibungen. |
| `Accent Cyan` | `#00FFED` | `text-cyan-400`, `border-cyan-500` | Primäre Akzentfarbe für Hervorhebungen, Links und aktive Zustände. |
| `Accent Magenta` | `#FF0090` | `text-fuchsia-500`, `border-fuchsia-500` | Sekundäre Akzentfarbe, oft für Aktionen und spezielle UI-Elemente. |
| `Card Background` | `rgba(15, 23, 42, 0.8)` | `bg-slate-900/80` | Hintergrund für Karten und Modals (mit Unschärfe-Effekt). |
| `Border Color` | `#334155` | `border-slate-700` | Standard-Randfarbe für UI-Elemente. |

Zusätzlich werden Verläufe verwendet:
- **Cyan zu Fuchsia:** `bg-gradient-to-br from-cyan-500 to-fuchsia-500`
- **Fuchsia zu Indigo:** `bg-gradient-to-br from-fuchsia-600 to-indigo-600`

### 4.2. Abstände

Das Projekt verwendet das standardmäßige, auf `rem`-Einheiten basierende Spacing-System von Tailwind CSS. Die Skala ist `0.25rem` (4px). Beispiele: `p-4` (1rem padding), `gap-6` (1.5rem gap). Details sind in der [Tailwind-Dokumentation](https://tailwindcss.com/docs/spacing) zu finden.

### 4.3. Schriftgrößen

- **Schriftart:** 'Inter', geladen von Google Fonts.
- **Größen:** Die typografische Skala von Tailwind wird verwendet (`text-sm`, `text-base`, `text-lg`, `text-xl`, ...).

### 4.4. Breakpoints

Es werden die Standard-Breakpoints von Tailwind CSS verwendet:
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

## 5. REST API Endpoints

### Auth / Profile
- `POST /api/auth/register` – Benutzer registrieren, Rückgabe `{ token }`.
- `POST /api/auth/login` – Benutzer anmelden, Rückgabe `{ token }`.
- `GET /api/profile` – Profil des angemeldeten Benutzers abrufen. `Authorization: Bearer <token>` erforderlich.

### Workflow Management
- `GET /api/workflows` – Liste aller Workflows.
- `POST /api/workflows` – Neuen Workflow anlegen. Body: `{ name, description, steps }`.
- `GET /api/workflows/:id` – Details eines Workflows abrufen.
- `PUT /api/workflows/:id` – Workflow aktualisieren.
- `DELETE /api/workflows/:id` – Workflow löschen.
- `POST /api/workflows/:id/execute` – Workflow zur Ausführung in die Queue stellen.
- `GET /api/workflows/queue` – Status der Workflow-Queue abrufen.
- `GET /api/workflows/queue/:id` – Details eines Queue-Eintrags abrufen.
- `POST /api/workflows/queue/:id/cancel` – Laufenden oder geplanten Workflow abbrechen.

Im Queue-Panel werden die Einträge mit einer farbigen Fortschrittsleiste angezeigt.
Der Status `cancelled` wird dabei rot hervorgehoben.

### Projektverwaltung
- `GET /api/projects` – Liste der Projekte des angemeldeten Nutzers
- `POST /api/projects` – Neues Projekt erstellen `{ name, description }`
- `GET /api/projects/:id` – Einzelnes Projekt abrufen
- `PUT /api/projects/:id` – Projekt aktualisieren `{ name?, description? }`
- `DELETE /api/projects/:id` – Projekt löschen

### Tools
- `GET /api/tools/list` – Liste aller verfügbaren Tools

