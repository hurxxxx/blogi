#!/bin/bash
# ============================================
# 헤더 스타일 기능 완전 롤백 스크립트
# 사용법: chmod +x scripts/rollback-header-style.sh && ./scripts/rollback-header-style.sh
# ============================================

set -e  # 오류 발생 시 중단

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "========================================"
echo "헤더 스타일 기능 롤백 시작"
echo "========================================"

# 1. DB 롤백
echo ""
echo "[1/4] 데이터베이스 롤백 중..."
if [ -z "$DATABASE_URL" ]; then
    # .env 파일에서 DATABASE_URL 로드
    if [ -f "$PROJECT_DIR/.env" ]; then
        export $(grep -v '^#' "$PROJECT_DIR/.env" | grep DATABASE_URL | xargs)
    fi
fi

if [ -z "$DATABASE_URL" ]; then
    echo "ERROR: DATABASE_URL이 설정되지 않았습니다."
    exit 1
fi

psql "$DATABASE_URL" -f "$SCRIPT_DIR/rollback-header-style.sql"
echo "데이터베이스 롤백 완료"

# 2. Prisma 클라이언트 재생성
echo ""
echo "[2/4] Prisma 클라이언트 재생성..."
cd "$PROJECT_DIR"
npx prisma generate
echo "Prisma 클라이언트 재생성 완료"

# 3. 빌드
echo ""
echo "[3/4] 빌드 중..."
npm run build
echo "빌드 완료"

# 4. PM2 재시작
echo ""
echo "[4/4] PM2 재시작..."
pm2 delete danang-vip 2>/dev/null || true
pm2 start ecosystem.config.cjs
pm2 save
echo "PM2 재시작 완료"

echo ""
echo "========================================"
echo "롤백 완료!"
echo "========================================"
