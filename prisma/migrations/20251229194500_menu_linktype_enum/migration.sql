-- Convert MenuItem.linkType to enum

-- Normalize legacy custom link types
UPDATE "MenuItem"
SET "linkType" = 'community'
WHERE "linkType" = 'custom' AND "href" LIKE '/community/%';

UPDATE "MenuItem"
SET "linkType" = 'category'
WHERE "linkType" = 'custom' AND "href" LIKE '/products/%';

UPDATE "MenuItem" mi
SET "linkedCategoryId" = c.id
FROM "Category" c
WHERE mi."linkType" = 'category'
  AND mi."linkedCategoryId" IS NULL
  AND mi."href" LIKE '/products/%'
  AND c.slug = replace(mi."href", '/products/', '');

UPDATE "MenuItem"
SET "linkType" = 'external'
WHERE "linkType" = 'custom';

UPDATE "MenuItem" SET "linkType" = 'category' WHERE "linkType" IS NULL;

ALTER TABLE "MenuItem" ALTER COLUMN "linkType" DROP DEFAULT;

CREATE TYPE "MenuLinkType" AS ENUM ('category', 'community', 'external');

ALTER TABLE "MenuItem"
  ALTER COLUMN "linkType" TYPE "MenuLinkType"
  USING ("linkType"::"MenuLinkType");

ALTER TABLE "MenuItem" ALTER COLUMN "linkType" SET DEFAULT 'category';
