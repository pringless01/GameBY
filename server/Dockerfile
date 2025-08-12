FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./

FROM base AS deps
RUN npm ci --omit=dev

FROM base AS build
RUN npm ci
COPY . .
# placeholder for future builds (TS/webpack not used) – verify sources
RUN node -e "process.exit(0)"

FROM node:18-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
