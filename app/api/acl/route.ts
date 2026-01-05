import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { extractCommunitySlug } from "@/lib/community";

const parseCategorySlugFromHref = (href?: string | null) => {
  if (!href) return "";
  if (!href.startsWith("/contents/")) return "";
  return href.replace("/contents/", "").replace(/^\/+/, "");
};

export async function GET(req: Request) {
  const marker = req.headers.get("x-middleware-request");
  if (marker !== "1") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const [menuItems, protectedCategories] = await Promise.all([
    prisma.menuItem.findMany({
      where: { requiresAuth: true, linkType: { in: ["category", "community"] } },
      select: { linkType: true, linkedCategoryId: true, href: true, label: true },
    }),
    prisma.category.findMany({
      where: { requiresAuth: true },
      select: { id: true, slug: true },
    }),
  ]);

  const protectedCategorySlugs = new Set<string>();
  const protectedCommunitySlugs = new Set<string>();
  const linkedCategoryIds: string[] = [];
  const menuCategorySlugs: string[] = [];

  protectedCategories.forEach((category) => {
    if (category.slug) {
      protectedCategorySlugs.add(category.slug);
    }
  });

  menuItems.forEach((item) => {
    if (item.linkType === "community") {
      const slug = extractCommunitySlug(item.href ?? "", item.label ?? "");
      if (slug) {
        protectedCommunitySlugs.add(slug);
      }
      return;
    }

    if (item.linkType === "category") {
      if (item.linkedCategoryId) {
        linkedCategoryIds.push(item.linkedCategoryId);
      }
      const slug = parseCategorySlugFromHref(item.href);
      if (slug) {
        menuCategorySlugs.push(slug);
        protectedCategorySlugs.add(slug);
      }
    }
  });

  const [linkedCategories, slugCategories] = await Promise.all([
    linkedCategoryIds.length
      ? prisma.category.findMany({
          where: { id: { in: linkedCategoryIds } },
          select: { slug: true },
        })
      : [],
    menuCategorySlugs.length
      ? prisma.category.findMany({
          where: { slug: { in: menuCategorySlugs } },
          select: { slug: true },
        })
      : [],
  ]);

  linkedCategories.forEach((category) => {
    if (category.slug) {
      protectedCategorySlugs.add(category.slug);
    }
  });
  slugCategories.forEach((category) => {
    if (category.slug) {
      protectedCategorySlugs.add(category.slug);
    }
  });

  return NextResponse.json({
    protectedCategorySlugs: Array.from(protectedCategorySlugs),
    protectedCommunitySlugs: Array.from(protectedCommunitySlugs),
  });
}
