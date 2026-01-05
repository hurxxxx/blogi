import { prisma } from "@/lib/prisma";

type CategoryAuthParams = {
  categoryId?: string | null;
  categorySlug?: string | null;
};

export const getMenuCategoryRequiresAuth = async ({
  categoryId,
  categorySlug,
}: CategoryAuthParams) => {
  const orFilters = [];
  if (categoryId) {
    orFilters.push({ linkedCategoryId: categoryId });
  }
  if (categorySlug) {
    orFilters.push({ href: `/contents/${categorySlug}` });
  }
  if (orFilters.length === 0) {
    return false;
  }

  const menuItems = await prisma.menuItem.findMany({
    where: {
      linkType: "category",
      OR: orFilters,
    },
    select: { requiresAuth: true },
  });

  return menuItems.some((item) => item.requiresAuth);
};

export const getRestrictedCategoryIdsFromMenu = async () => {
  const restrictedItems = await prisma.menuItem.findMany({
    where: {
      linkType: "category",
      requiresAuth: true,
    },
    select: {
      linkedCategoryId: true,
      href: true,
    },
  });

  const ids = new Set<string>();
  const slugs: string[] = [];

  restrictedItems.forEach((item) => {
    if (item.linkedCategoryId) {
      ids.add(item.linkedCategoryId);
      return;
    }
    if (item.href?.startsWith("/contents/")) {
      const slug = item.href.replace("/contents/", "").replace(/^\/+/, "");
      if (slug) {
        slugs.push(slug);
      }
    }
  });

  if (slugs.length) {
    const categories = await prisma.category.findMany({
      where: { slug: { in: slugs } },
      select: { id: true },
    });
    categories.forEach((category) => ids.add(category.id));
  }

  return Array.from(ids);
};
