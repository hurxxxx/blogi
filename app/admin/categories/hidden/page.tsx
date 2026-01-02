import { prisma } from "@/lib/prisma";
import { HiddenCategoriesManager } from "@/components/admin/hidden-categories-manager";

export const dynamic = "force-dynamic";

export default async function HiddenCategoriesPage() {
  // 숨김 카테고리 조회
  const hiddenCategories = await prisma.category.findMany({
    where: { isVisible: false },
    include: {
      _count: {
        select: { contents: true }
      }
    },
    orderBy: { updatedAt: "desc" },
  });

  // 이동 대상 카테고리 (visible only)
  const visibleCategories = await prisma.category.findMany({
    where: { isVisible: true },
    select: {
      id: true,
      name: true,
      slug: true,
    },
    orderBy: { order: "asc" },
  });

  const categories = hiddenCategories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    updatedAt: cat.updatedAt.toISOString(),
    _count: cat._count,
  }));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm md:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="font-display text-3xl">숨김 카테고리</h1>
            <p className="text-sm text-gray-500 mt-2">
              메뉴에서 삭제된 카테고리를 복구하거나 영구 삭제할 수 있습니다.
            </p>
            <p className="text-sm text-gray-400 mt-1">
              콘텐츠가 있는 카테고리는 다른 카테고리로 이동 후 삭제할 수 있습니다.
            </p>
          </div>
          <div className="text-sm text-gray-500">
            {categories.length}개 항목
          </div>
        </div>
      </div>

      <HiddenCategoriesManager
        categories={categories}
        targetCategories={visibleCategories}
      />
    </div>
  );
}
