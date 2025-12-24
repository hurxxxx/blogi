-- CreateTable
CREATE TABLE "SiteSettings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "footerEnabled" BOOLEAN NOT NULL DEFAULT true,
    "termsUrl" TEXT,
    "privacyUrl" TEXT,
    "showTerms" BOOLEAN NOT NULL DEFAULT true,
    "showPrivacy" BOOLEAN NOT NULL DEFAULT true,
    "businessInfo" TEXT,
    "showBusinessInfo" BOOLEAN NOT NULL DEFAULT true,
    "socialLinks" JSONB,
    "showSocials" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SiteSettings_key_key" ON "SiteSettings"("key");
