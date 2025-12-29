-- Normalize relations: Product -> Category, Post -> Board, MenuItem -> Category

-- MenuItem: linkedCategoryId
ALTER TABLE "MenuItem" ADD COLUMN "linkedCategoryId" TEXT;

UPDATE "MenuItem" AS m
SET "linkedCategoryId" = c.id
FROM "Category" AS c
WHERE m."linkedId" IS NOT NULL
  AND m."linkedId" = c.id;

-- Post: boardId
ALTER TABLE "Post" ADD COLUMN "boardId" TEXT;

-- Backfill by board key
UPDATE "Post" AS p
SET "boardId" = b.id
FROM "Board" AS b
WHERE p."boardId" IS NULL
  AND lower(b.key) = lower(p.type);

-- Backfill by board slug parsed from type
UPDATE "Post" AS p
SET "boardId" = b.id
FROM "Board" AS b
WHERE p."boardId" IS NULL
  AND split_part(p.type, '__', 2) = b.slug;

-- Fallback: first board (order, createdAt)
WITH first_board AS (
  SELECT id FROM "Board" ORDER BY "order" ASC, "createdAt" ASC LIMIT 1
)
UPDATE "Post" AS p
SET "boardId" = (SELECT id FROM first_board)
WHERE p."boardId" IS NULL;

-- Enforce boardId
ALTER TABLE "Post" ALTER COLUMN "boardId" SET NOT NULL;
ALTER TABLE "Post" ADD CONSTRAINT "Post_boardId_fkey"
  FOREIGN KEY ("boardId") REFERENCES "Board"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- Remove legacy type column
ALTER TABLE "Post" DROP COLUMN "type";

-- Product: enforce categoryId and drop legacy category column
ALTER TABLE "Product" ALTER COLUMN "categoryId" SET NOT NULL;
ALTER TABLE "Product" DROP COLUMN "category";

-- MenuItem: add FK and drop legacy linkedId
ALTER TABLE "MenuItem" ADD CONSTRAINT "MenuItem_linkedCategoryId_fkey"
  FOREIGN KEY ("linkedCategoryId") REFERENCES "Category"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "MenuItem" DROP COLUMN "linkedId";
