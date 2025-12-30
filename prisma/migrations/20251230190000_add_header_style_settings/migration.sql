-- AlterTable
ALTER TABLE "SiteSettings" ADD COLUMN     "headerStyle" TEXT NOT NULL DEFAULT 'classic',
ADD COLUMN     "headerScrollEffect" BOOLEAN NOT NULL DEFAULT true;
