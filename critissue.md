# Critical Issue Dossier: WebSocket-Architektur

**Datum:** 25. Juli 2025
**Status:** In Umsetzung
**Verantwortliches Team:** KI-Entwicklerteam (Codex)

---

## 1. Executive Summary
Die Analyse ergab, dass eine von Gemini automatisch generierte WebSocket-Implementierung unbrauchbar war. Daraufhin wurde eine Neuentwicklung beschlossen, die ein kanalisierbares Protokoll mit Authentifizierung vorsieht. Ziel ist eine stabile Echtzeit-Kommunikation zwischen Frontend und Backend für Flow Weaver.

## 2. Problembeschreibung und Ursachenanalyse

### 2.1 Ursprünglicher technischer Fehler
Der erste WebSocket-Endpunkt lieferte beim Handshake einen 404-Fehler. Dies wurde in den Sprint-Protokollen als Hauptproblem identifiziert und führte zur sofortigen Untersuchung.

### 2.2 Grundursache (Root Cause)
Eine von Google AI Studio / Gemini erzeugte Platzhalter-Implementation fehlte jegliche spezifische Logik. Sie musste laut Changelog komplett entfernt werden, da sie nicht funktionsfähig war.

### 2.3 Auswirkungen auf die Applikation
Mehrere zentrale Funktionen greifen über `WebSocketService` auf das Backend zu – u. a. der Login-Fluss und die Werkzeugliste. Durch den fehlerhaften Handshake blieben diese Features wirkungslos und lieferten nur statische oder gar keine Daten.

## 3. Zielarchitektur und technische Spezifikation

### 3.1 Funktionale Anforderung
Die Echtzeit-Kommunikation soll Live-Benachrichtigungen, kollaborative Workflows und Monitoring ermöglichen. Die UI ruft dynamisch die Liste verfügbarer Tools ab und steuert Workflows interaktiv.

### 3.2 Technische Lösungsarchitektur
- **Authentifizierung:** Beim WebSocket-Handshake wird ein JWT geprüft; ungültige Tokens führen zu `401 Unauthorized`.
- **Architektur:** Clients können Kanäle abonnieren oder verlassen (Subscribe/Unsubscribe). Nutzdaten werden kanalbasiert verteilt.
- **Datenprotokoll:** Jede Nachricht ist strikt als JSON-Objekt mit `event`, `channel` und `payload` aufgebaut.

## 4. Aktueller Umsetzungsplan

### 4.1 Abgeschlossene Meilensteine
- Aufbau der Docker-Infrastruktur und Basistests
- Erstes MCP-Backend mit WebSocket und REST-Schnittstellen
- React-Prototyp mit Flow‑Canvas und WebSocket‑Anbindung
- Entfernung der nicht-funktionalen Gemini-Implementierung und Fix des `/ws`-Handshakes

### 4.2 Nächste konkrete Schritte (Aktueller Sprint)
1. Implementiere den neuen WebSocketService im Frontend mit Reconnect und Kanälen.
2. Entwickle einen Worker-Prozess zur Abarbeitung der Workflow-Queue im Backend.
3. Dokumentiere die Queue-Endpunkte und Worker-Architektur in backend.md.

## 5. Offene Punkte, Risiken und strategische Notizen
- WebSocket-Verbindungen sollen später gezielt pro Benutzer für Tool‑Status genutzt werden.
- Eine dedizierte Workflow-Queue und zugehörige Worker stehen noch aus.
- Automatische Cloud‑Deployments und ein Migrations-Tool wie Knex werden erwogen.

---
**Ende des Dossiers**
