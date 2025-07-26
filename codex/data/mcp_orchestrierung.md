# MCP-Orchestrierung

`flowdoc.md` beschreibt die Claude-Flow-Architektur mit Hive-Mind-Intelligenz und einem umfangreichen Satz an MCP-Tools. Kern ist das Dynamic Agent Architecture-Modell, das Agenten über einen WebSocket-Server koordiniert. Persistente Daten werden in einer SQLite-Datenbank gespeichert. Das Backend stellt Befehle wie `tools/batch` bereit, um mehrere Tool-Aufrufe effizient auszuführen.

Die MCP-Komponenten kommunizieren über JSON-RPC. Hooks ermöglichen automatisierte Abläufe vor und nach jeder Operation. Die Dokumentation enthält Hinweise zum lokalen Start der Services sowie eine Liste der verfügbaren Tools.
