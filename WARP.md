# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

Repository overview

- Monorepo managed by pnpm workspaces (packages/_, apps/_).
- Purpose: a docker-deployable, type-safe socket server with a React dashboard, a TypeScript SDK (React hook provider), and a CLI to define/push/generate schemas.
- Node engine: >=20 <21 (Node 20 is required).

Prerequisites

- Node 20.x
- pnpm 9.x (packageManager pinned to pnpm@9.7.0; use corepack enable && corepack prepare pnpm@9.7.0 --activate if needed)

Common commands

- Install dependencies (workspace root)

  - pnpm install

- Build everything

  - pnpm build

- Development (quick start)

  - pnpm dev (starts server in dev mode)
  - pnpm start (starts server from built output)

- Server commands

  - pnpm dev:server (development with ts-node-dev, listens on :8080)
  - pnpm build:server (compile TypeScript)
  - pnpm start:server (run from built JS)

- Dashboard commands

  - pnpm dev:dashboard (Vite dev server, typically :5173)
  - pnpm build:dashboard (build for production)
  - pnpm preview:dashboard (preview built dashboard)

- Chat Demo commands

  - pnpm dev:chat-demo (Next.js dev server, typically :3000)
  - pnpm build:chat-demo (build for production)
  - pnpm start:chat-demo (start production server)

- Build individual packages/apps

  - pnpm --filter @maravian/maravian-sockets-sdk run build
  - pnpm --filter @maravian/maravian-sockets-cli run build
  - pnpm --filter @maravian/maravian-sockets-types run build

- Dashboard development setup

  - PowerShell (Windows): $env:VITE_SERVER_URL = 'http://localhost:8080'
  - Bash (Linux/macOS): export VITE_SERVER_URL='http://localhost:8080'
  - Then: pnpm dev:dashboard
  - Note: In production, the server serves the built dashboard from packages/server/public.

- CLI (develop and run locally)

  - Build CLI: pnpm --filter @maravian/maravian-sockets-cli run build
  - Run CLI (no publish): node packages/cli/dist/index.js --help
  - Examples:
    - node packages/cli/dist/index.js init --out socketmax.config.ts
    - node packages/cli/dist/index.js push --server http://localhost:8080 --app-id myapp --app-key {{APP_KEY}} --config ./socketmax.config.ts
    - node packages/cli/dist/index.js generate --server http://localhost:8080 --app-id myapp --dts-out ./maravian-sockets.generated.d.ts --ts-out ./maravian-sockets.helpers.ts

- Docker

  - docker compose up --build -d
  - Visits: http://localhost:8080 (API and Dashboard served by the same container)

- Linting/formatting

  - No linter is configured in this repo. Root has a placeholder format script.

- Tests
  - No test runner or test scripts are configured as of now.

Environment

- Key variables (used by server and/or docker-compose):
  - PORT (default 8080)
  - JWT_SECRET (JWT signing secret)
  - ADMIN_EMAIL / ADMIN_PASSWORD (bootstrap an admin user on first run)
  - DB_PATH (default ./data/socketmax.db; Docker uses /data/socketmax.db)
  - CORS_ORIGIN (default \*; set to your dashboard/consumer origin in non-dev)

High-level architecture and data flow

- Workspace layout (big picture)

  - packages/server: Express + Socket.IO server backed by SQLite (better-sqlite3). Serves HTTP APIs and Socket.IO events; can optionally serve the built Dashboard from packages/server/public.
  - packages/types: Type-safe schema DSL definitions using zod (defineSchema, message primitives, system types).
  - packages/cli: Commander-based CLI for schema lifecycle: init, push (zod -> JSON Schema conversion and POST to server), generate (DTS + optional TS helpers), schema:pull, log.
  - packages/sdk: React provider (SocketMaxProvider) and hook (useMaravianSockets) wrapping socket.io-client with typed helpers and admin methods.
  - apps/dashboard: Vite/React admin UI for login, app management, schema push, room/topic overview, live message stream, and user administration.
  - apps/chat-demo: Next.js example application demonstrating real-time chat using the SDK and type-safe socket connections.

- Schema pipeline

  - Author schemas as TypeScript via zod using the DSL (often in socketmax.config.ts).
  - CLI push converts zod payloads to JSON Schema (partial converter) and POSTs to /api/schema/push with appId/appKey/version.
  - Server persists the raw schema JSON into SQLite (schemas table) and updates the topics table; the latest schema per app drives runtime validation and topic typing.

- Server responsibilities (packages/server/src/index.ts)

  - Auth: JWT-based; /api/login issues tokens, roles embedded in JWT (admin role controls privileged APIs). Admin user can be bootstrapped from env.
  - App management (admin-only):
    - POST /api/apps creates an appId/appKey pair
    - GET /api/apps lists apps
  - Schema:
    - POST /api/schema/push validates appKey, stores schema version, and ingests topics
    - GET /api/schema/versions lists versions for an app
    - GET /api/schema/latest returns latest schema JSON for an app
  - Topics/rooms:
    - GET /api/topics?appId=...
    - GET /api/rooms?appId=...
    - POST /api/rooms (auth) create new room
    - POST /api/rooms/admins (admin) grant/revoke room admins
  - Users (admin):
    - GET /api/users
    - POST /api/users/roles
    - POST /api/users/ban
    - GET /api/users/connected (no auth) returns currently connected sockets/users
  - Messages:
    - GET /api/messages?appId=...&topic=...&room=...&limit=...
  - Static dashboard:
    - Serves packages/server/public if present; otherwise responds with a plain message at GET \*
  - Socket.IO events:
    - On connection: optionally validates JWT (if provided) and tracks presence
    - Built-in topics emitted by the server:
      - system.connection (status updates)
      - system.presence (user join/leave with user lists)
    - Room controls: room.join, room.leave
    - Admin (socket-level): admin.ban, admin.unban (require JWT role admin)
    - Publish pipeline: client emits publish { appId, topic, type, payload, room? }
      - Server loads latest schema for appId, locates topic/message, validates payload with AJV (compiled from stored JSON Schema), persists message to SQLite, and broadcasts either to a room or globally on the topic event name.

- SDK (packages/sdk)

  - SocketMaxProvider manages a socket.io-client instance with auth token handling, onTopic subscription helper, publish with ack, join/leave room helpers, and admin helpers (ban/unban via socket events). The React hook useMaravianSockets exposes this client API.

- Dashboard (apps/dashboard)

  - Reads VITE_SERVER_URL (falls back to window.location.origin) for API base; in dev, set VITE_SERVER_URL to the server address.
  - Provides:
    - Login panel (calls /api/login)
    - Apps bar (list/create apps; displays newly generated appKey once)
    - Topics/Rooms inspectors
    - Schema panel (edit JSON and push to /api/schema/push using appId/appKey/version)
    - Live message stream (subscribes to system.\* and configured topics; optional filter)
    - Admin Users (list users, toggle admin role, ban/unban via HTTP)

- Docker image
  - Multi-stage build installs workspace deps, builds packages and the dashboard, copies the dashboard build into packages/server/public, and ships only server runtime deps in the final image. Exposes :8080.

Notes and gotchas

- better-sqlite3 requires native toolchain for local node-gyp builds. If you lack a C++ build chain on Windows, prefer Docker for running the server or install the “Desktop development with C++” workload (Visual Studio Build Tools). The Docker flow avoids local compilation issues.
- CORS_ORIGIN defaults to \*. Set it appropriately for non-dev environments.
- App keys are shown only at creation time; store them securely.
