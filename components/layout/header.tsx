import { HeaderClient } from "@/components/layout/header-client";
import { getMenuByKey } from "@/lib/menus";
import { getFooterSettings } from "@/lib/footer-settings";

export const Header = async () => {
  const menu = await getMenuByKey("main");
  const settings = await getFooterSettings();
  return (
    <HeaderClient
      menuItems={menu.items}
      siteName={settings.siteName || "다낭VIP투어"}
      siteLogoUrl={settings.siteLogoUrl || "/logo.png"}
    />
  );
};
