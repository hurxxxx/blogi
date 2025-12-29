import { prisma } from "@/lib/prisma";

export type SiteSettingsSnapshot = {
  siteName?: string | null;
  siteLogoUrl?: string | null;
  communityEnabled: boolean;
};

export const getSiteSettings = async (): Promise<SiteSettingsSnapshot> => {
  const settings = await prisma.siteSettings.findUnique({
    where: { key: "default" },
  });

  return {
    siteName: settings?.siteName ?? null,
    siteLogoUrl: settings?.siteLogoUrl ?? null,
    communityEnabled: settings?.communityEnabled ?? true,
  };
};
