import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";
import { ensureDefaultBoards } from "@/lib/boards";

const requireAdmin = async () => {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return null;
  }
  return session;
};

const getOrCreateMenu = async (key: string, name?: string) => {
  const existing = await prisma.menu.findUnique({ where: { key } });
  if (existing) return existing;
  return prisma.menu.create({
    data: {
      key,
      name: name || key,
    },
  });
};

const resolveLinkType = (value?: string, href?: string) => {
  if (value === "community") return "community";
  if (value === "category") return "category";
  if (href?.startsWith("/community")) return "community";
  return "category";
};

const resolveCategorySlug = (href?: string, label?: string) => {
  if (href?.startsWith("/products/")) {
    return href.replace("/products/", "").trim();
  }
  if (href) {
    return href.replace(/^\/+/, "").trim();
  }
  if (label) {
    return slugify(label);
  }
  return "";
};

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "관리자 권한이 필요합니다" }, { status: 403 });
  }

  const body = await req.json();
  const { action } = body;

  if (action === "create") {
    const { menuKey, data } = body;
    if (!menuKey || !data?.label) {
      return NextResponse.json({ error: "필수 항목이 누락되었습니다" }, { status: 400 });
    }
    const menu = await getOrCreateMenu(menuKey, menuKey === "footer" ? "Footer" : "Main");
    const linkType = resolveLinkType(data.linkType, data.href);
    let href = data.href;
    let linkedId: string | null = null;
    if (linkType === "community") {
      href = "/community";
      await ensureDefaultBoards();
    } else {
      const slug = resolveCategorySlug(data.href, data.label);
      if (!slug) {
        return NextResponse.json({ error: "카테고리 주소가 필요합니다" }, { status: 400 });
      }
      href = `/products/${slug}`;
      const category = await prisma.category.upsert({
        where: { slug },
        update: {
          name: data.label,
          isVisible: data.isVisible ?? true,
          order: data.order ?? 0,
        },
        create: {
          name: data.label,
          slug,
          isVisible: data.isVisible ?? true,
          order: data.order ?? 0,
        },
      });
      linkedId = category.id;
    }
    const item = await prisma.menuItem.create({
      data: {
        menuId: menu.id,
        label: data.label,
        href,
        order: data.order ?? 0,
        isVisible: data.isVisible ?? true,
        isExternal: data.isExternal ?? false,
        openInNew: data.openInNew ?? false,
        requiresAuth: data.requiresAuth ?? false,
        badgeText: data.badgeText || null,
        linkType,
        linkedId,
      },
    });
    revalidatePath("/admin/menus");
    revalidatePath("/", "layout");
    return NextResponse.json(item, { status: 201 });
  }

  if (action === "update") {
    const { id, data } = body;
    if (!id) {
      return NextResponse.json({ error: "ID가 필요합니다" }, { status: 400 });
    }
    const existing = await prisma.menuItem.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "메뉴를 찾을 수 없습니다" }, { status: 404 });
    }
    const linkType = resolveLinkType(data.linkType, data.href ?? existing.href);
    let href = data.href ?? existing.href;
    let linkedId: string | null = existing.linkedId ?? null;
    if (linkType === "community") {
      href = "/community";
      if (existing.linkType === "category" && existing.linkedId) {
        await prisma.category.update({
          where: { id: existing.linkedId },
          data: { isVisible: false },
        });
      }
      linkedId = null;
      await ensureDefaultBoards();
    } else {
      const slug = resolveCategorySlug(data.href ?? existing.href, data.label ?? existing.label);
      if (!slug) {
        return NextResponse.json({ error: "카테고리 주소가 필요합니다" }, { status: 400 });
      }
      href = `/products/${slug}`;
      if (linkedId) {
        const prevCategory = await prisma.category.findUnique({ where: { id: linkedId } });
        if (prevCategory && prevCategory.slug !== slug) {
          await prisma.product.updateMany({
            where: { category: prevCategory.slug },
            data: { category: slug },
          });
        }
        await prisma.category.update({
          where: { id: linkedId },
          data: {
            name: data.label ?? existing.label,
            slug,
            isVisible: data.isVisible ?? existing.isVisible,
          },
        });
      } else {
        const category = await prisma.category.upsert({
          where: { slug },
          update: {
            name: data.label ?? existing.label,
            isVisible: data.isVisible ?? true,
          },
          create: {
            name: data.label ?? existing.label,
            slug,
            isVisible: data.isVisible ?? true,
            order: existing.order ?? 0,
          },
        });
        linkedId = category.id;
      }
    }
    const item = await prisma.menuItem.update({
      where: { id },
      data: {
        label: data.label,
        href,
        isVisible: data.isVisible,
        isExternal: data.isExternal,
        openInNew: data.openInNew,
        requiresAuth: data.requiresAuth,
        badgeText: data.badgeText || null,
        linkType,
        linkedId,
      },
    });
    revalidatePath("/admin/menus");
    revalidatePath("/", "layout");
    return NextResponse.json(item);
  }

  if (action === "delete") {
    const { id } = body;
    if (!id) {
      return NextResponse.json({ error: "ID가 필요합니다" }, { status: 400 });
    }
    const existing = await prisma.menuItem.findUnique({ where: { id } });
    await prisma.menuItem.delete({ where: { id } });
    if (existing?.linkType === "category" && existing.linkedId) {
      await prisma.category.update({
        where: { id: existing.linkedId },
        data: { isVisible: false },
      });
    }
    revalidatePath("/admin/menus");
    revalidatePath("/", "layout");
    return NextResponse.json({ success: true });
  }

  if (action === "reorder") {
    const { menuKey, items } = body;
    if (!menuKey || !Array.isArray(items)) {
      return NextResponse.json({ error: "정렬 정보가 필요합니다" }, { status: 400 });
    }
    const menu = await getOrCreateMenu(menuKey, menuKey === "footer" ? "Footer" : "Main");
    const menuUpdates = items.map((item: { id: string; order: number }) =>
      prisma.menuItem.update({
        where: { id: item.id },
        data: { order: item.order, menuId: menu.id },
      })
    );
    const linkedItems = await prisma.menuItem.findMany({
      where: { id: { in: items.map((item: { id: string }) => item.id) } },
      select: { id: true, linkType: true, linkedId: true },
    });
    const orderMap = new Map(items.map((item: { id: string; order: number }) => [item.id, item.order]));
    const categoryUpdates = linkedItems
      .filter((item) => item.linkType === "category" && item.linkedId)
      .map((item) =>
        prisma.category.update({
          where: { id: item.linkedId as string },
          data: { order: orderMap.get(item.id) ?? 0 },
        })
      );
    await prisma.$transaction([...menuUpdates, ...categoryUpdates]);
    revalidatePath("/admin/menus");
    revalidatePath("/", "layout");
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "지원하지 않는 동작입니다" }, { status: 400 });
}
