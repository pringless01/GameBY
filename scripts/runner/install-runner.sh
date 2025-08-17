#!/usr/bin/env bash
set -euo pipefail

# Config
GITHUB_REPO="pringless01/GameBY"
RUNNER_DIR="${RUNNER_DIR:-$HOME/actions-runner}"
RUNNER_NAME="${RUNNER_NAME:-gameby-$(hostname)}"
RUNNER_LABELS="${RUNNER_LABELS:-self-hosted,prod,gameby}"
RUNNER_TOKEN="${RUNNER_TOKEN:-}"

if [[ -z "$RUNNER_TOKEN" ]]; then
  echo "ERROR: Set RUNNER_TOKEN (GitHub -> Repo -> Settings -> Actions -> Runners -> New self-hosted runner)." >&2
  exit 1
fi

mkdir -p "$RUNNER_DIR"
cd "$RUNNER_DIR"

echo "[runner] Fetching latest actions runner release…"
LATEST_JSON=$(curl -fsSL https://api.github.com/repos/actions/runner/releases/latest)
URL=$(printf "%s" "$LATEST_JSON" | grep -oE '"browser_download_url"\s*:\s*"[^"]*linux-x64[^\"]*"' | head -n1 | cut -d '"' -f4)
if [[ -z "$URL" ]]; then
  echo "ERROR: Could not detect runner download URL." >&2
  exit 1
fi

TMP_TGZ="actions-runner-linux-x64.tar.gz"
curl -fsSL "$URL" -o "$TMP_TGZ"
tar -xzf "$TMP_TGZ"
rm -f "$TMP_TGZ"

echo "[runner] Configuring…"
./config.sh \
  --url "https://github.com/$GITHUB_REPO" \
  --token "$RUNNER_TOKEN" \
  --labels "$RUNNER_LABELS" \
  --name "$RUNNER_NAME" \
  --unattended \
  --work _work

echo "[runner] Installing as a service… (sudo required)"
if command -v sudo >/dev/null 2>&1; then
  sudo ./svc.sh install
  sudo ./svc.sh start
else
  ./run.sh &
fi

echo "[runner] Done. Check GitHub Settings → Actions → Runners."
