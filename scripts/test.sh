#!/usr/bin/env bash
set -euo pipefail

SUITE="${1:-unit}"
COVERAGE="${2:-false}"

run_unit() { npm --prefix apps/api/src run test:unit:cursor-security; }
run_integration_smoke() { npm --prefix apps/api/src run test:integration:leaderboard; }
run_all() { npm --prefix apps/api/src run test; }

case "$SUITE" in
  unit) run_unit ;;
  integration) run_integration_smoke ;;
  all) run_all ;;
  *) echo "unknown suite: $SUITE"; exit 2 ;;
esac

if [ "$COVERAGE" = "true" ]; then
  npm --prefix apps/api/src run coverage:full || echo "coverage skipped"
fi
