# Codex Agent Instructions

## Overview
This repository contains a React/TypeScript frontend, a Node.js/Express backend and an MCP module. Documentation lives under `codex/data/`.

## Build & Test
- Install dependencies with `npm install` for each module when needed.
- Run backend and MCP tests via `JWT_SECRET=test npm test` at repo root.
- Run frontend tests with `npm --prefix frontend test`.
- Build frontend with `npm --prefix frontend run build`.
- Build MCP with `npm --prefix mcp run build`.

## Tasks
1. Ensure TailwindCSS styling works in the frontend.
2. Keep this file and module specific `AGENTS.md` files updated.
3. Improve test coverage based on `codex/data/tests.md`.
