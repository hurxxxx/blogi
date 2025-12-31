import { prisma } from "@/lib/prisma";
import { HeaderStyle, isValidHeaderStyle } from "@/lib/header-styles";

export type SiteSettingsSnapshot = {
  siteName?: string | null;
  siteLogoUrl?: string | null;
  siteTagline?: string | null;
  siteDescription?: string | null;
  ogImageUrl?: string | null;
  faviconUrl?: string | null;
  // 헤더 스타일 설정
  headerStyle: HeaderStyle;
  headerScrollEffect: boolean;
};

export const getSiteSettings = async (): Promise<SiteSettingsSnapshot> => {
  const settings = await prisma.siteSettings.findUnique({
    where: { key: "default" },
  });

  // headerStyle 유효성 검사
  const headerStyle =
    settings?.headerStyle && isValidHeaderStyle(settings.headerStyle)
      ? settings.headerStyle
      : "classic";

  return {
    siteName: settings?.siteName ?? null,
    siteLogoUrl: settings?.siteLogoUrl ?? null,
    siteTagline: settings?.siteTagline ?? null,
    siteDescription: settings?.siteDescription ?? null,
    ogImageUrl: settings?.ogImageUrl ?? null,
    faviconUrl: settings?.faviconUrl ?? null,
    headerStyle,
    headerScrollEffect: settings?.headerScrollEffect ?? true,
  };
};
