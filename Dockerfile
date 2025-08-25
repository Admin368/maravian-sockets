# --- base ---
FROM node:20-bullseye AS base
WORKDIR /app

# --- deps ---
FROM base AS deps
COPY package.json tsconfig.base.json ./
COPY packages/types/package.json ./packages/types/package.json
COPY packages/server/package.json ./packages/server/package.json
COPY packages/sdk/package.json ./packages/sdk/package.json
COPY packages/cli/package.json ./packages/cli/package.json
COPY apps/dashboard/package.json ./apps/dashboard/package.json
RUN npm install --workspaces

# --- build ---
FROM deps AS build
COPY . .
RUN npm run -ws build

# Copy dashboard build into server public
RUN mkdir -p packages/server/public && cp -r apps/dashboard/dist/* packages/server/public/

# --- runtime ---
FROM node:20-bullseye AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Install only server production deps
COPY package.json ./
COPY packages/server/package.json ./packages/server/package.json
RUN npm install --workspaces --omit=dev

# Copy built server
COPY --from=build /app/packages/server/dist ./packages/server/dist
# Copy public (dashboard)
COPY --from=build /app/packages/server/public ./packages/server/public

ENV PORT=8080
EXPOSE 8080
CMD ["node", "packages/server/dist/index.js"]
