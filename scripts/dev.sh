#!/usr/bin/env bash
set -euo pipefail
if [[ "${1:-}" == "--watch" ]]; then
  npm --prefix apps/api/src run dev
else
  npm --prefix apps/api/src run start
fi
