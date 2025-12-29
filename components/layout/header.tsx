import { HeaderClient } from "@/components/layout/header-client";
import { getMenuByKey } from "@/lib/menus";
import { getFooterSettings } from "@/lib/footer-settings";
import { getBoards } from "@/lib/boards";
import { getSiteSettings } from "@/lib/site-settings";

export const Header = async () => {
  const menu = await getMenuByKey("main");
  const [footerSettings, siteSettings, boards] = await Promise.all([
    getFooterSettings(),
    getSiteSettings(),
    getBoards(),
  ]);
  return (
    <HeaderClient
      menuItems={menu.items}
      siteName={footerSettings.siteName || "다낭VIP투어"}
      siteLogoUrl={footerSettings.siteLogoUrl || "/logo.png"}
      boards={boards}
      communityEnabled={siteSettings.communityEnabled}
    />
  );
};
