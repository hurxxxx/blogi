import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { slugify } from "@/lib/slug";
import { DEFAULT_MAIN_MENU } from "@/lib/menus";

const ensureCategoriesFromMenu = async () => {
  const menu = await prisma.menu.findUnique({
    where: { key: "main" },
    include: { items: { orderBy: { order: "asc" } } },
  });
  const itemsSource = menu?.items?.length
    ? menu.items
    : DEFAULT_MAIN_MENU.map((item, index) => ({
        ...item,
        order: item.order ?? index + 1,
        isVisible: item.isVisible ?? true,
      }));
  // 카테고리 타입만 필터링 (community, external 제외)
  const items = itemsSource.filter(
    (item) => item.linkType === "category" ||
      (!item.linkType && item.href?.startsWith("/products/"))
  );
  const data = items
    .map((item, index) => {
      const slug = item.href?.startsWith("/products/")
        ? item.href.replace("/products/", "").trim()
        : slugify(item.label);
      if (!slug) return null;
      return {
        name: item.label,
        slug,
        order: item.order ?? index + 1,
        isVisible: item.isVisible ?? true,
      };
    })
    .filter(Boolean) as { name: string; slug: string; order: number; isVisible: boolean }[];

  // 카테고리 upsert로 변경하여 메뉴와 동기화
  for (const cat of data) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, order: cat.order, isVisible: cat.isVisible },
      create: cat,
    });
  }
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const includeHidden = searchParams.get("all") === "true";
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN";

  if (includeHidden && !isAdmin) {
    return NextResponse.json({ error: "관리자 권한이 필요합니다" }, { status: 403 });
  }

  await ensureCategoriesFromMenu();
  const categories = await prisma.category.findMany({
    where: includeHidden ? {} : { isVisible: true },
    orderBy: { order: "asc" },
  });
  return NextResponse.json(categories);
}
