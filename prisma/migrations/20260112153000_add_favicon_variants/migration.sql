-- Add favicon variant fields
ALTER TABLE "SiteSettings"
ADD COLUMN     "faviconPng16" TEXT,
ADD COLUMN     "faviconPng32" TEXT,
ADD COLUMN     "faviconAppleTouch" TEXT,
ADD COLUMN     "faviconAndroid192" TEXT,
ADD COLUMN     "faviconAndroid512" TEXT,
ADD COLUMN     "faviconIco" TEXT;
