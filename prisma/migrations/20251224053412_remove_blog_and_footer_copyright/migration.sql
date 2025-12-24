/*
  Warnings:

  - You are about to drop the `BlogCategory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BlogPost` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BlogPostTag` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BlogTag` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "BlogPost" DROP CONSTRAINT "BlogPost_authorId_fkey";

-- DropForeignKey
ALTER TABLE "BlogPost" DROP CONSTRAINT "BlogPost_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "BlogPostTag" DROP CONSTRAINT "BlogPostTag_postId_fkey";

-- DropForeignKey
ALTER TABLE "BlogPostTag" DROP CONSTRAINT "BlogPostTag_tagId_fkey";

-- AlterTable
ALTER TABLE "SiteSettings" ADD COLUMN     "copyrightText" TEXT,
ADD COLUMN     "showCopyright" BOOLEAN NOT NULL DEFAULT true;

-- DropTable
DROP TABLE "BlogCategory";

-- DropTable
DROP TABLE "BlogPost";

-- DropTable
DROP TABLE "BlogPostTag";

-- DropTable
DROP TABLE "BlogTag";
