# --- base ---
FROM node:20-bullseye AS base
WORKDIR /app

# --- deps ---
FROM base AS deps
COPY package.json tsconfig.base.json ./
COPY pnpm-workspace.yaml ./
COPY packages/types/package.json ./packages/types/package.json
COPY packages/server/package.json ./packages/server/package.json
COPY packages/sdk/package.json ./packages/sdk/package.json
COPY packages/cli/package.json ./packages/cli/package.json
COPY apps/dashboard/package.json ./apps/dashboard/package.json
RUN corepack enable && corepack prepare pnpm@9.7.0 --activate && pnpm install --frozen-lockfile=false

# --- build ---
FROM deps AS build
COPY . .
RUN pnpm -r run build && pnpm --filter @maravian-sockets/dashboard run build

# Copy dashboard build into server public
RUN mkdir -p packages/server/public && cp -r apps/dashboard/dist/* packages/server/public/

# --- runtime ---
FROM node:20-bullseye AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Install only server production deps
COPY package.json ./
COPY pnpm-workspace.yaml ./
COPY packages/server/package.json ./packages/server/package.json
RUN corepack enable && corepack prepare pnpm@9.7.0 --activate && pnpm install --filter @maravian-sockets/server --prod --frozen-lockfile=false

# Copy built server
COPY --from=build /app/packages/server/dist ./packages/server/dist
# Copy public (dashboard)
COPY --from=build /app/packages/server/public ./packages/server/public

ENV PORT=8080
EXPOSE 8080
CMD ["node", "packages/server/dist/index.js"]
