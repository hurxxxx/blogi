import { HeaderClient } from "@/components/layout/header-client";
import { getMenuByKey } from "@/lib/menus";
import { getFooterSettings } from "@/lib/footer-settings";
import { getSiteSettings } from "@/lib/site-settings";
import { getCommunityGroups } from "@/lib/community";
import { getDefaultBannerForBackground, getDefaultLogoForBackground } from "@/lib/branding";

export const Header = async () => {
  const menu = await getMenuByKey("main");
  const [footerSettings, siteSettings, communityGroups] = await Promise.all([
    getFooterSettings(),
    getSiteSettings(),
    getCommunityGroups(),
  ]);
  const fallbackLogoUrl = getDefaultLogoForBackground(siteSettings.themeColors.headerBg);
  const fallbackBannerUrl = getDefaultBannerForBackground(siteSettings.themeColors.headerBg);

  return (
    <HeaderClient
      menuItems={menu.items}
      siteName={footerSettings.siteName || "사이트"}
      siteLogoUrl={footerSettings.siteLogoUrl || fallbackLogoUrl}
      siteBannerUrl={siteSettings.siteBannerUrl || fallbackBannerUrl}
      siteTagline={siteSettings.siteTagline || ""}
      communityGroups={communityGroups}
      headerStyle={siteSettings.headerStyle}
      headerScrollEffect={siteSettings.headerScrollEffect}
      hideSearch={siteSettings.hideSearch}
      logoSize={siteSettings.logoSize}
      siteNamePosition={siteSettings.siteNamePosition}
      showMobileTopSiteName={siteSettings.showMobileTopSiteName}
      showMobileTopSiteNameSize={siteSettings.showMobileTopSiteNameSize}
    />
  );
};
