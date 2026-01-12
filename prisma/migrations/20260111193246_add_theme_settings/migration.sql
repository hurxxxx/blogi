-- Add theme settings columns to SiteSettings
ALTER TABLE "SiteSettings" ADD COLUMN "themePreset" TEXT NOT NULL DEFAULT 'classic-navy';
ALTER TABLE "SiteSettings" ADD COLUMN "customHeaderBg" TEXT;
ALTER TABLE "SiteSettings" ADD COLUMN "customHeaderText" TEXT;
ALTER TABLE "SiteSettings" ADD COLUMN "customFooterBg" TEXT;
ALTER TABLE "SiteSettings" ADD COLUMN "customFooterText" TEXT;
ALTER TABLE "SiteSettings" ADD COLUMN "customPrimary" TEXT;
ALTER TABLE "SiteSettings" ADD COLUMN "customAccent" TEXT;
ALTER TABLE "SiteSettings" ADD COLUMN "customContentBg" TEXT;
