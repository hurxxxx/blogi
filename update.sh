#!/usr/bin/env bash
set -euo pipefail

APP_NAME="danang-vip"
PORT="${PORT:-3010}"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

ensure_pm2() {
  if ! command -v pm2 >/dev/null 2>&1; then
    echo "pm2 is not installed."
    exit 1
  fi
}

kill_port_process() {
  local pid
  pid=$(fuser "$PORT/tcp" 2>/dev/null | xargs) || true
  if [ -n "$pid" ]; then
    echo "Killing process $pid on port $PORT..."
    kill "$pid" 2>/dev/null || true
    sleep 2
  fi
}

ensure_app_running() {
  # 포트를 사용하는 기존 프로세스 종료
  kill_port_process

  # pm2 상태 확인 및 처리
  local status
  status=$(pm2 jlist 2>/dev/null | grep -o "\"name\":\"$APP_NAME\"[^}]*\"status\":\"[^\"]*\"" | grep -o '"status":"[^"]*"' | cut -d'"' -f4) || true

  if [ "$status" = "online" ] || [ "$status" = "stopping" ]; then
    pm2 restart "$APP_NAME"
  elif [ "$status" = "errored" ] || [ "$status" = "stopped" ]; then
    pm2 delete "$APP_NAME" 2>/dev/null || true
    (cd "$ROOT_DIR" && pm2 start npm --name "$APP_NAME" -- start -- -p "$PORT")
    pm2 save
  else
    # 앱이 pm2에 등록되어 있지 않은 경우
    (cd "$ROOT_DIR" && pm2 start npm --name "$APP_NAME" -- start -- -p "$PORT")
    pm2 save
  fi
}

ensure_pm2

cd "$ROOT_DIR"
echo "Pull latest changes..."
git pull

echo "Install dependencies..."
npm ci

echo "Generate Prisma client..."
npx prisma generate

echo "Run DB migrations..."
npm run db:deploy

echo "Clean previous build..."
rm -rf .next

echo "Build..."
npm run build

echo "Restart app..."
ensure_app_running

echo "Update completed."
