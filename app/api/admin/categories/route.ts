import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
    }

    const categories = await prisma.category.findMany({
      orderBy: { order: "asc" },
    });

    return NextResponse.json(categories);
  } catch {
    return NextResponse.json({ error: "카테고리 목록을 불러오는 중 오류가 발생했습니다." }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
    }

    const body = await request.json();
    const { id, thumbnailUrl, description } = body;

    if (!id) {
      return NextResponse.json({ error: "카테고리 ID가 필요합니다." }, { status: 400 });
    }

    const updated = await prisma.category.update({
      where: { id },
      data: {
        ...(thumbnailUrl !== undefined && { thumbnailUrl }),
        ...(description !== undefined && { description }),
      },
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "카테고리 수정 중 오류가 발생했습니다." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
    }

    const body = await request.json();
    const { action, id, data } = body;

    if (action === "update") {
      if (!id) {
        return NextResponse.json({ error: "카테고리 ID가 필요합니다." }, { status: 400 });
      }

      const updated = await prisma.category.update({
        where: { id },
        data: {
          ...(data?.thumbnailUrl !== undefined && { thumbnailUrl: data.thumbnailUrl }),
          ...(data?.description !== undefined && { description: data.description }),
        },
      });

      return NextResponse.json(updated);
    }

    // 카테고리 복구
    if (action === "restore") {
      const { menuKey = "main" } = body;

      if (!id) {
        return NextResponse.json({ error: "카테고리 ID가 필요합니다." }, { status: 400 });
      }

      const category = await prisma.category.findUnique({ where: { id } });
      if (!category) {
        return NextResponse.json({ error: "카테고리를 찾을 수 없습니다." }, { status: 404 });
      }
      if (category.isVisible) {
        return NextResponse.json({ error: "이미 활성화된 카테고리입니다." }, { status: 400 });
      }

      // 메뉴 찾기 또는 생성
      let menu = await prisma.menu.findUnique({ where: { key: menuKey } });
      if (!menu) {
        menu = await prisma.menu.create({
          data: { key: menuKey, name: menuKey === "main" ? "Main" : menuKey }
        });
      }

      // 최대 order 값 조회
      const maxOrder = await prisma.menuItem.aggregate({
        where: { menuId: menu.id },
        _max: { order: true }
      });

      // 트랜잭션으로 카테고리 복구 + 메뉴 아이템 생성
      await prisma.$transaction([
        prisma.category.update({
          where: { id },
          data: { isVisible: true }
        }),
        prisma.menuItem.create({
          data: {
            menuId: menu.id,
            label: category.name,
            href: `/contents/${category.slug}`,
            linkType: "category",
            linkedCategoryId: id,
            order: (maxOrder._max.order ?? 0) + 1,
            isVisible: true
          }
        })
      ]);

      revalidatePath("/admin/menus");
      revalidatePath("/admin/categories/hidden");
      revalidatePath("/", "layout");

      return NextResponse.json({ success: true, message: "카테고리가 복구되었습니다." });
    }

    // 콘텐츠 일괄 이동
    if (action === "moveContents") {
      const { fromCategoryId, toCategoryId } = body;

      if (!fromCategoryId || !toCategoryId) {
        return NextResponse.json({ error: "출발/도착 카테고리 ID가 필요합니다." }, { status: 400 });
      }

      if (fromCategoryId === toCategoryId) {
        return NextResponse.json({ error: "같은 카테고리로는 이동할 수 없습니다." }, { status: 400 });
      }

      const [fromCategory, toCategory] = await Promise.all([
        prisma.category.findUnique({ where: { id: fromCategoryId } }),
        prisma.category.findUnique({ where: { id: toCategoryId } })
      ]);

      if (!fromCategory || !toCategory) {
        return NextResponse.json({ error: "카테고리를 찾을 수 없습니다." }, { status: 404 });
      }

      if (!toCategory.isVisible) {
        return NextResponse.json({ error: "숨김 상태의 카테고리로는 이동할 수 없습니다." }, { status: 400 });
      }

      const result = await prisma.content.updateMany({
        where: { categoryId: fromCategoryId },
        data: { categoryId: toCategoryId }
      });

      revalidatePath("/admin/contents");
      revalidatePath("/admin/categories/hidden");
      revalidatePath(`/contents/${fromCategory.slug}`);
      revalidatePath(`/contents/${toCategory.slug}`);

      return NextResponse.json({
        success: true,
        movedCount: result.count,
        message: `${result.count}개의 콘텐츠가 이동되었습니다.`
      });
    }

    // 영구 삭제
    if (action === "permanentDelete") {
      if (!id) {
        return NextResponse.json({ error: "카테고리 ID가 필요합니다." }, { status: 400 });
      }

      const category = await prisma.category.findUnique({
        where: { id },
        include: {
          _count: { select: { contents: true } }
        }
      });

      if (!category) {
        return NextResponse.json({ error: "카테고리를 찾을 수 없습니다." }, { status: 404 });
      }

      if (category.isVisible) {
        return NextResponse.json({ error: "활성화된 카테고리는 삭제할 수 없습니다." }, { status: 400 });
      }

      if (category._count.contents > 0) {
        return NextResponse.json({
          error: `콘텐츠가 ${category._count.contents}개 있습니다. 먼저 다른 카테고리로 이동해주세요.`
        }, { status: 400 });
      }

      await prisma.category.delete({ where: { id } });

      revalidatePath("/admin/categories/hidden");

      return NextResponse.json({
        success: true,
        message: "카테고리가 영구 삭제되었습니다."
      });
    }

    return NextResponse.json({ error: "지원하지 않는 동작입니다." }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "카테고리 수정 중 오류가 발생했습니다." }, { status: 500 });
  }
}
