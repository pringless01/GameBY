#!/usr/bin/env bash
set -euo pipefail

RUNNER_DIR="${RUNNER_DIR:-$HOME/actions-runner}"
cd "$RUNNER_DIR"

if command -v sudo >/dev/null 2>&1; then
  sudo ./svc.sh stop || true
  sudo ./svc.sh uninstall || true
  sudo ./svc.sh install
  sudo ./svc.sh start
else
  pkill -f run.sh || true
  nohup ./run.sh >/dev/null 2>&1 &
fi

echo "[runner] service repaired"
