ALTER TABLE "SiteSettings" ADD COLUMN "siteBannerUrlLight" TEXT;
ALTER TABLE "SiteSettings" ADD COLUMN "siteBannerUrlDark" TEXT;
ALTER TABLE "SiteSettings" ADD COLUMN "siteBannerMode" TEXT NOT NULL DEFAULT 'light';
