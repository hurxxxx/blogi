-- ============================================
-- 헤더 스타일 기능 롤백 스크립트
-- 실행 방법: psql $DATABASE_URL -f scripts/rollback-header-style.sql
-- ============================================

-- 1. 추가된 컬럼 삭제
ALTER TABLE "SiteSettings" DROP COLUMN IF EXISTS "headerStyle";
ALTER TABLE "SiteSettings" DROP COLUMN IF EXISTS "headerScrollEffect";

-- 2. 마이그레이션 기록 삭제 (Prisma 마이그레이션 히스토리)
DELETE FROM "_prisma_migrations"
WHERE migration_name LIKE '%header_style%';

-- 3. 확인
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'SiteSettings'
ORDER BY ordinal_position;
