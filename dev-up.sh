#!/usr/bin/env bash
# =============================================================================
# dev-up.sh — Start ALL bergeerd services for local development
#
# What it does:
#   1. Verifies local Docker containers (MongoDB + MinIO) are running
#   2. Starts the Go backend           → http://localhost:8080
#   3. Starts the Admin Panel (Vite)   → http://localhost:5173
#   4. Starts the public Website (Vite)→ http://localhost:3000
#   5. Tails combined logs (Ctrl-C stops everything cleanly)
#
# Infrastructure prerequisites (already running on this machine):
#   • Docker container "sansyar-mongo"  → MongoDB on localhost:27017
#   • Docker container "sansyar-minio"  → MinIO   on localhost:9000
#   These are the user's existing containers. This script does NOT start/stop
#   them — it only checks that they're up so the API can connect.
#
# App prerequisites: go, node/npm installed. .env files already exist.
# =============================================================================
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="$ROOT/.dev-logs"
mkdir -p "$LOG_DIR"

# ---------------------------------------------------------------------------
# 1) Verify infrastructure: local Docker containers must be running
# ---------------------------------------------------------------------------
echo "▶ 1/4  Checking local Docker containers…"
if ! command -v docker >/dev/null 2>&1; then
  echo "   ✖ docker not found. Start your sansyar-mongo + sansyar-minio containers first."
  exit 1
fi

check_container() {
  local name="$1" port="$2" health_url="$3"
  if ! docker ps --format '{{.Names}}' | grep -qx "$name"; then
    echo "   ✖ container '$name' is not running."
    echo "     Start it with:  docker start $name"
    exit 1
  fi
  if ! curl -sf --max-time 2 "$health_url" >/dev/null 2>&1 \
     && ! (echo > /dev/tcp/localhost/"$port") >/dev/null 2>&1; then
    echo "   ✖ port $port is not reachable on localhost."
    exit 1
  fi
  echo "   ✔ $name is up (:$port)"
}

# MinIO has an HTTP health endpoint; Mongo we just probe the TCP port.
if curl -sf --max-time 2 http://localhost:9000/minio/health/live >/dev/null 2>&1; then
  echo "   ✔ sansyar-minio is up (:9000)"
else
  echo "   ✖ MinIO not reachable on :9000 — start it: docker start sansyar-minio"
  exit 1
fi

if docker exec sansyar-mongo mongosh --quiet --eval "db.adminCommand({ping:1}).ok" 2>/dev/null | grep -q "1"; then
  echo "   ✔ sansyar-mongo is up (:27017)"
else
  echo "   ✖ MongoDB not reachable on :27017 — start it: docker start sansyar-mongo"
  exit 1
fi

echo "   (bergeerd_api/.env already points to localhost:27017 + localhost:9000)"

# ---------------------------------------------------------------------------
# 2) Start the Go backend
# ---------------------------------------------------------------------------
echo "▶ 2/4  Starting Go backend (bergeerd_api) on :8080…"
# Free the port in case a previous run is still bound
fuser -k 8080/tcp 2>/dev/null || true; sleep 1
(
  cd "$ROOT/bergeerd_api" \
  && SEED_IMAGES_DIR="$ROOT/bergeerd_menu/src/assets" \
     go run ./cmd/api > "$LOG_DIR/api.log" 2>&1
) &
API_PID=$!
echo "   api pid: $API_PID  (log: .dev-logs/api.log)"

# ---------------------------------------------------------------------------
# 3) Start Admin Panel + Website (Vite dev servers)
# ---------------------------------------------------------------------------
echo "▶ 3/4  Starting Admin Panel (:5173) + Website (:3000)…"
fuser -k 5173/tcp 2>/dev/null || true
fuser -k 3000/tcp 2>/dev/null || true
sleep 1
( cd "$ROOT/bergeerd_admin" && npm run dev > "$LOG_DIR/admin.log" 2>&1 ) &
ADMIN_PID=$!
( cd "$ROOT/bergeerd_menu"  && npm run dev > "$LOG_DIR/menu.log"  2>&1 ) &
MENU_PID=$!
echo "   admin pid: $ADMIN_PID  (log: .dev-logs/admin.log)"
echo "   menu  pid: $MENU_PID  (log: .dev-logs/menu.log)"

# ---------------------------------------------------------------------------
# 4) Wait for the API health endpoint, then print summary + tail logs
# ---------------------------------------------------------------------------
echo "▶ 4/4  Waiting for API health…"
echo -n "   "
for i in $(seq 1 30); do
  if curl -sf --max-time 2 http://localhost:8080/health >/dev/null 2>&1; then
    echo "OK"; break
  fi
  echo -n "."; sleep 1
  if [[ $i -eq 30 ]]; then
    echo " TIMEOUT (check .dev-logs/api.log)"
    echo "   --- last 20 lines of api.log ---"
    tail -n 20 "$LOG_DIR/api.log" 2>/dev/null || true
    exit 1
  fi
done

cat <<EOF

============================================================
 ✅  Bergeerd dev environment is running

   • Go API       → http://localhost:8080        (.dev-logs/api.log)
   • Admin Panel  → http://localhost:5173        (.dev-logs/admin.log)
   • Website      → http://localhost:3000        (.dev-logs/menu.log)

   Admin login:  admin / admin123

   Logs :  tail -f .dev-logs/api.log .dev-logs/admin.log .dev-logs/menu.log
   Stop :  ./dev-down.sh   (or press Ctrl-C here)
============================================================
EOF

# Tail logs until Ctrl-C, then shut everything down.
# NOTE: we do NOT kill ports 27017/9000 — those belong to the local Docker
# containers that should keep running.
trap '
  echo; echo "Stopping all bergeerd app services…";
  kill '"$API_PID"' '"$ADMIN_PID"' '"$MENU_PID"' 2>/dev/null || true;
  '"$ROOT"'/dev-down.sh;
  exit 0
' INT TERM
tail -f "$LOG_DIR/api.log" "$LOG_DIR/admin.log" "$LOG_DIR/menu.log" 2>/dev/null || true
