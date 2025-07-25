# WebSocket Endpoint

The backend exposes a WebSocket endpoint used for JSON-RPC communication.

## URL
`ws://<host>/ws`

A valid JWT must be provided as the `token` query parameter.

Example:
```
ws://localhost:3008/ws?token=<JWT>
```

## Authentication
The token is verified during the HTTP upgrade handshake. If the token is missing or invalid, the connection is rejected with `401 Unauthorized`.

## RPC Methods
Once connected, clients can call the following methods:
- `tools/list` – returns the tool catalog.
- `tools/call` – execute a single tool.
- `tools/batch` – execute multiple tools sequentially.
