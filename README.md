# Socket Max

Socket Max is a docker-deployable, type-safe socket server with a techy dashboard, a TypeScript schema DSL, a React SDK (useSocketMax hook), and a CLI for schema push/generate/pull.

Highlights:
- Typesafe topics and message schemas (Zod/JSON Schema)
- Express + Socket.IO server with SQLite persistence
- Dashboard UI for auth, topics, rooms, users, live message stream & filters
- React SDK with typed subscribe/publish and room/auth/admin helpers
- CLI: `init`, `push`, `generate`, `schema pull`, `log`
- Docker image that serves both API and Dashboard; SQLite persisted via volume

## Quickstart

1) Install deps (workspace root):
- npm install

2) Build all packages:
- npm run build

3) Dev server:
- npm run dev:server

4) Build Dashboard:
- npm run build:dashboard

5) Docker (from repo root):
- docker compose up --build -d

Server runs on http://localhost:8080 and serves the Dashboard at `/`.

Environment variables (Docker or local):
- PORT: default 8080
- JWT_SECRET: secret for issuing JWTs
- ADMIN_EMAIL / ADMIN_PASSWORD: bootstrap admin
- DB_PATH: default `./data/socketmax.db` (Docker uses `/data/socketmax.db`)
- CORS_ORIGIN: allowed origin (e.g. http://localhost:5173)

CLI usage example (after `npm install`):
- npx socket-max init
- npx socket-max push --config ./socketmax.config.ts --server http://localhost:8080 --app-id myapp --app-key {{APP_KEY}}
- npx socket-max generate --server http://localhost:8080 --app-id myapp --out ./socket-max.generated.d.ts

See apps/dashboard and packages for more details.
