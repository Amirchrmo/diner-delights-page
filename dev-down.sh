#!/usr/bin/env bash
# =============================================================================
# dev-down.sh — Stop all bergeerd local dev APP services
#
# This stops ONLY the application processes started by dev-up.sh:
#   • Go API        (port 8080)
#   • Admin Panel   (port 5173)
#   • Website       (port 3000)
#
# It does NOT touch the local Docker infrastructure containers
# (sansyar-mongo on :27017 and sansyar-minio on :9000) — those are the
# user's existing services and should keep running.
# =============================================================================
set -uo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "Stopping bergeerd app services…"

# Free only the app ports — NOT 27017/9000 (those are local Docker containers).
for port in 8080 5173 3000; do
  if fuser -k "$port/tcp" 2>/dev/null; then
    echo "  freed :$port"
  fi
done

# Kill any stray go-run / compiled api processes (scoped by our project path).
pkill -f "go run.*bergeerd_api.*cmd/api" 2>/dev/null && echo "  killed go-run api" || true

echo "Done. (Docker containers sansyar-mongo & sansyar-minio left running.)"
