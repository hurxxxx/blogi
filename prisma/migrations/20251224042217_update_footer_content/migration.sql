/*
  Warnings:

  - You are about to drop the column `businessInfo` on the `SiteSettings` table. All the data in the column will be lost.
  - You are about to drop the column `privacyUrl` on the `SiteSettings` table. All the data in the column will be lost.
  - You are about to drop the column `termsUrl` on the `SiteSettings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "SiteSettings" DROP COLUMN "businessInfo",
DROP COLUMN "privacyUrl",
DROP COLUMN "termsUrl",
ADD COLUMN     "businessLines" JSONB,
ADD COLUMN     "privacyContent" TEXT,
ADD COLUMN     "privacyContentMarkdown" TEXT,
ADD COLUMN     "termsContent" TEXT,
ADD COLUMN     "termsContentMarkdown" TEXT;
