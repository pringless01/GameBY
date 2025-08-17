#!/usr/bin/env bash
set -euo pipefail
npm --prefix apps/api/src run test:unit:cursor-security
# Optional coverage
if npm --version >/dev/null 2>&1; then
  npm --prefix apps/api/src run coverage:full || echo "coverage skipped"
fi
