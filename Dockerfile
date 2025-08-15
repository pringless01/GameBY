FROM node:20-slim AS base
WORKDIR /app
ENV NODE_ENV=production

FROM base AS server-deps
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci --omit=dev || npm ci

FROM node:20-slim AS fe-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN [ -f package.json ] && npm ci || true
COPY frontend/ ./
RUN [ -f package.json ] && (npm run build || true) || true

FROM node:20-slim
WORKDIR /app
ENV NODE_ENV=production PORT=3000
COPY server/ ./server/
COPY --from=fe-build /app/frontend/dist/ /app/frontend/dist/
COPY frontend/public/ /app/frontend/public/
COPY --from=server-deps /app/server/node_modules /app/server/node_modules
EXPOSE 3000
WORKDIR /app/server
CMD ["node", "server.js"]
