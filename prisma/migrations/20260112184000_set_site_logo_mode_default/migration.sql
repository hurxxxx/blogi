ALTER TABLE "SiteSettings" ALTER COLUMN "siteLogoMode" SET DEFAULT 'light';
UPDATE "SiteSettings" SET "siteLogoMode" = 'light' WHERE "siteLogoMode" NOT IN ('light', 'dark');
