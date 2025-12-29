-- Backfill Product.categoryId based on Category.slug and normalize Product.category to slug.

UPDATE "Product" AS p
SET "categoryId" = c.id,
    "category" = c.slug
FROM "Category" AS c
WHERE p."categoryId" IS NULL
  AND (
    lower(replace(replace(p."category", '_', '-'), ' ', '-')) = lower(c.slug)
    OR lower(p."category") = lower(c.name)
  );

UPDATE "Product" AS p
SET "category" = c.slug
FROM "Category" AS c
WHERE p."categoryId" = c.id
  AND p."category" <> c.slug;
