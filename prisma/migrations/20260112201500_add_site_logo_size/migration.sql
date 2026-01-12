ALTER TABLE "SiteSettings" ADD COLUMN "siteLogoSize" TEXT NOT NULL DEFAULT 'medium';
UPDATE "SiteSettings" SET "siteLogoSize" = "logoSize" WHERE "siteLogoSize" IS NULL;
