-- Add mobile dashboard visibility setting to SiteSettings
ALTER TABLE "SiteSettings" ADD COLUMN "showHomeDashboardOnMobile" BOOLEAN NOT NULL DEFAULT true;
