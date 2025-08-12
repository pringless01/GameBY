FROM node:20-bullseye-slim AS base
WORKDIR /app
COPY package*.json ./

# Sadece prod bağımlılıkları kur; prepare gibi lifecycle scriptleri atla
FROM base AS deps
# Build toolchain (node-gyp) ve python gerekli
RUN apt-get update \
 && apt-get install -y --no-install-recommends python3 make g++ \
 && rm -rf /var/lib/apt/lists/*
# Lock uyumsuzluğu durumunda ci -> install fallback (repro toleransı)
RUN npm ci --omit=dev --ignore-scripts || npm install --omit=dev --ignore-scripts
# Native modülleri derle (sqlite3, bcrypt)
RUN npm rebuild sqlite3 bcrypt --verbose || npm rebuild sqlite3 --build-from-source --verbose && npm rebuild bcrypt --verbose

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
