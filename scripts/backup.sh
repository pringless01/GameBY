#!/usr/bin/env bash
set -euo pipefail

# Config
BASE_DIR="/srv/gameby/GameBY"
BACKUP_DIR="/srv/gameby/backups"
TS=$(date +"%Y%m%d-%H%M%S")
ARCHIVE="$BACKUP_DIR/gameby-backup-$TS.tar.gz"

mkdir -p "$BACKUP_DIR"

echo "[backup] collecting files..."
TMPDIR=$(mktemp -d)
trap 'rm -rf "$TMPDIR"' EXIT

# Collect files
[ -f "$BASE_DIR/.env" ] && cp -a "$BASE_DIR/.env" "$TMPDIR/.env" || true
cp -a "$BASE_DIR/docker-compose.yml" "$TMPDIR/"
cp -a "$BASE_DIR/nginx.conf" "$TMPDIR/"
[ -f "$BASE_DIR/server/Dockerfile" ] && cp -a "$BASE_DIR/server/Dockerfile" "$TMPDIR/" || true
[ -f "$BASE_DIR/server/server.js" ] && cp -a "$BASE_DIR/server/server.js" "$TMPDIR/" || true
[ -f "$BASE_DIR/server/package.json" ] && cp -a "$BASE_DIR/server/package.json" "$TMPDIR/" || true

# Database: copy from docker volume path via container (safer)
API_CID=$(docker ps --filter name=gameby-api-1 --format '{{.ID}}' || true)
if [ -n "$API_CID" ]; then
  echo "[backup] exporting DB via container..."
  docker cp "$API_CID:/data/game.db" "$TMPDIR/game.db" 2>/dev/null || echo "[backup] warn: DB not found"
else
  echo "[backup] warn: api container not running; skipping DB copy"
fi

# Logs (last 200 lines)
docker compose -f "$BASE_DIR/docker-compose.yml" logs --no-color --tail=200 > "$TMPDIR/docker-logs.txt" || true

echo "[backup] creating archive $ARCHIVE"
 tar -C "$TMPDIR" -czf "$ARCHIVE" .

# Keep last 14 backups
echo "[backup] pruning old backups (keep last 14)"
ls -1t "$BACKUP_DIR"/gameby-backup-*.tar.gz 2>/dev/null | tail -n +15 | xargs -r rm -f

echo "[backup] done -> $ARCHIVE"
