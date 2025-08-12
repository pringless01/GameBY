FROM node:20-bullseye-slim AS base
WORKDIR /app
COPY package*.json ./

# Sadece prod bağımlılıkları kur; prepare gibi lifecycle scriptleri atla
FROM base AS deps
# Lock uyumsuzluğu durumunda ci -> install fallback (repro toleransı)
RUN npm ci --omit=dev --ignore-scripts || npm install --omit=dev --ignore-scripts

# Runtime imajı
FROM node:20-bullseye-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
# Healthcheck aracı için curl ekle
RUN apt-get update \
 && apt-get install -y --no-install-recommends curl \
 && rm -rf /var/lib/apt/lists/*
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
