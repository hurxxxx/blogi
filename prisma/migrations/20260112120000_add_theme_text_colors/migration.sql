-- Add theme text color overrides for header and buttons
ALTER TABLE "SiteSettings"
ADD COLUMN     "customHeaderSiteNameText" TEXT,
ADD COLUMN     "customHeaderMenuText" TEXT,
ADD COLUMN     "customButtonText" TEXT;
