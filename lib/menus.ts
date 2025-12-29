import { prisma } from "@/lib/prisma";

export type MenuItemData = {
  id?: string;
  label: string;
  href: string;
  order?: number;
  isVisible?: boolean;
  isExternal?: boolean;
  openInNew?: boolean;
  requiresAuth?: boolean;
  badgeText?: string | null;
  linkType?: "category" | "community";
  linkedId?: string | null;
};

export const DEFAULT_MAIN_MENU: MenuItemData[] = [
  { label: "카지노", href: "/products/casino", order: 1, linkType: "category" },
  { label: "다낭 유흥", href: "/products/nightlife", order: 2, linkType: "category" },
  { label: "프로모션", href: "/products/promotion", order: 3, linkType: "category" },
  { label: "VIP 여행", href: "/products/vip-trip", order: 4, requiresAuth: true, linkType: "category" },
  { label: "여행 TIP", href: "/products/tip", order: 5, linkType: "category" },
  { label: "호텔 & 풀빌라", href: "/products/hotel-villa", order: 6, linkType: "category" },
  { label: "골프 & 레저", href: "/products/golf", order: 7, linkType: "category" },
  { label: "커뮤니티", href: "/community", order: 8, linkType: "community" },
];


const normalizeMenuItems = (items: MenuItemData[]) =>
  items
    .filter((item) => item.isVisible !== false)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

export const getMenuByKey = async (key: string) => {
  const menu = await prisma.menu.findUnique({
    where: { key },
    include: {
      items: { orderBy: { order: "asc" } },
    },
  });

  if (!menu || menu.items.length === 0) {
    const defaults = DEFAULT_MAIN_MENU;
    return {
      id: menu?.id ?? "default",
      key,
      name: key === "footer" ? "Footer" : "Main",
      items: normalizeMenuItems(defaults).map((item, index) => ({
        ...item,
        id: `default-${key}-${index}`,
      })),
    };
  }

  return {
    id: menu.id,
    key: menu.key,
    name: menu.name,
    items: menu.items.filter((item) => item.isVisible).map((item) => ({
      id: item.id,
      label: item.label,
      href: item.href,
      order: item.order,
      isExternal: item.isExternal,
      openInNew: item.openInNew,
      requiresAuth: item.requiresAuth,
      badgeText: item.badgeText,
      isVisible: item.isVisible,
      linkType:
        item.linkType === "community" || item.linkType === "category"
          ? (item.linkType as MenuItemData["linkType"])
          : item.href?.startsWith("/community")
            ? "community"
            : "category",
      linkedId: item.linkedId ?? null,
    })),
  };
};
