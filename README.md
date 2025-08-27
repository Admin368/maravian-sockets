# Maravian Sockets

Maravian Sockets is a docker-deployable, type-safe socket server with a dashboard, a TypeScript schema DSL, a React SDK (useMSocket hook), and a CLI for schema push/generate/pull.

Highlights:

- Typesafe topics and message schemas (Zod/JSON Schema)
- Express + Socket.IO server with SQLite persistence
- Dashboard UI for auth, topics, rooms, users, live message stream & filters
- React SDK with typed subscribe/publish and room/auth/admin helpers
- CLI v3: `init`, `push`, `generate`, `schema pull`, `log` with improved project structure
- Docker image that serves both API and Dashboard; SQLite persisted via volume

## Quickstart (pnpm)

1. Install deps (workspace root):

- pnpm install

2. Build all packages:

- pnpm run build

3. Dev server:

- pnpm run dev:server

4. Build Dashboard:

- pnpm run build:dashboard

5. Docker (from repo root):

- docker compose up --build -d

Server runs on http://localhost:8080 and serves the Dashboard at `/`.

Environment variables (Docker or local):

- PORT: default 8080
- JWT_SECRET: secret for issuing JWTs
- ADMIN_EMAIL / ADMIN_PASSWORD: bootstrap admin
- DB_PATH: default `./data/msocket.db` (Docker uses `/data/msocket.db`)
- CORS_ORIGIN: allowed origin (e.g. http://localhost:5173)

## CLI v3 Usage

The CLI v3 provides an enhanced developer experience with better project organization:

### Initialize a new project:

```bash
npx @maravian/maravian-sockets-cli init
```

This creates:

- `msocket/` folder containing all socket-related files
- `msocket/schema.config.js` with ESLint configuration and environment variable support
- `msocket/generated.d.ts` for TypeScript type definitions
- `.env` with MSocket configuration
- Updated `package.json` with convenient npm scripts:
  - `msocket:init` - Initialize the project
  - `msocket:push` - Push schema to server
  - `msocket:generate` - Generate TypeScript types

### Push schema to server:

```bash
npm run msocket:push
# or directly: npx @maravian/maravian-sockets-cli push
```

### Generate TypeScript types:

```bash
npm run msocket:generate
# or directly: npx @maravian/maravian-sockets-cli generate
```

### Environment Variables:

The CLI v3 supports environment variables for seamless integration:

- `NEXT_PUBLIC_MSOCKET_SERVER_URL` - Server URL (default: http://localhost:8080)
- `NEXT_PUBLIC_MSOCKET_APP_ID` - Your application ID
- `NEXT_PUBLIC_MSOCKET_APP_KEY` - Your application key

See apps/dashboard and packages for more details.

---

Publishing to npm (for each publishable package)

- Ensure you are logged in: pnpm npm login (or npm login)
- Set package versions as needed (e.g., 0.1.0) and ensure publishConfig.access is public for scoped packages (@maravian/\*)
- Build the workspace: pnpm build
- From the repo root, publish packages:
  - pnpm --filter @maravian/maravian-sockets-types publish --access public --no-git-checks
  - pnpm --filter @maravian/maravian-sockets-sdk publish --access public --no-git-checks
  - pnpm --filter @maravian/maravian-sockets-cli publish --access public --no-git-checks
  - (Server is typically not published; it ships via Docker.)
- Tag versions in git if you like: git tag -a v0.1.0 -m "v0.1.0" && git push --tags

Notes:

- If you encounter 403 or 404, verify your npm scope permissions and that the package name is unused.
- You can set registry per scope if you use a private registry.

Local development guide (Windows-friendly)

- Requirements: Node 20.x, pnpm (corepack enable && corepack prepare pnpm@9.7.0 --activate), Git, optional Docker.
- Install deps:
  - pnpm install
- Build everything:
  - pnpm build
- Run the server in dev mode:
  - pnpm dev:server
- Build the dashboard (served by server):
  - pnpm build:dashboard
- Use the CLI locally without publishing:
  - Build CLI: pnpm --filter @maravian/maravian-sockets-cli run build
  - Execute via ts-node (dev):
    - pnpm --filter @maravian/maravian-sockets-cli exec node dist/index.js --help
  - Or create a local global link (optional):
    - pnpm --filter @maravian/maravian-sockets-cli link -g (then run `maravian-sockets --help`)
- Use SDK locally in another project without publishing:
  - In this repo: pnpm --filter @maravian/maravian-sockets-sdk build
  - In your other project: pnpm add link:"C:\\\_ GITHUB\\socket_server_max\\packages\\sdk"
- Troubleshooting better-sqlite3 native build:
  - Prefer Docker for the server if local node-gyp toolchain isnt available.
  - Otherwise install Visual Studio Build Tools (Desktop development with C++) for node-gyp.

Docker dev

- docker compose up --build -d
- Visit http://localhost:8080

FAQ

- Q: npm install at the root fails with workspace install scripts?  
  A: We now use pnpm; run `pnpm install` at the root. Each package has no install script, only build. Root scripts use pnpm and avoid invalid `-ws` flags and `true` on Windows.
- Q: How do I test the CLI without publishing?  
  A: Build the CLI then run: `node packages/cli/dist/index.js --help`, or globally link the package with `pnpm --filter @maravian/maravian-sockets-cli link -g`.
- Q: How do I consume the SDK locally?  
  A: Use pnpm link or `pnpm add link:"<absolute path to packages/sdk>"` in your consumer app.
