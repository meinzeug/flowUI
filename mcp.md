# MCP Service

Der MCP-Service stellt einen internen WebSocket-Server bereit. Er wird ausschließlich vom REST-Backend angesprochen und ist nicht öffentlich erreichbar.

## Start

```bash
npm install
npm run dev
```

Der Server lauscht auf `MCP_PORT` (Standard 3008). Die Verbindung erfolgt innerhalb des Docker-Netzwerks.

## Authentifizierung

Bei der WebSocket-Handshakesendung muss ein JWT im ersten Message-Paket übergeben werden:

```json
{ "token": "<jwt>" }
```

Das Backend stellt dieses Token aus und reicht es im Proxy weiter.

## Befehle

Nach erfolgreicher Authentifizierung akzeptiert der Server folgende Events:

- `tools/batch` – führt mehrere Tools via `claude-flow` CLI aus
- `tools/run` – startet einen einzelnen Flow

Die Ausführung erfolgt über das CLI in `src/cli.ts` mittels `child_process.spawn`.
