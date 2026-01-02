"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { useConfirm } from "@/components/ui/confirm-dialog";
import { RotateCcw, Trash2, FolderX, ArrowRight, AlertTriangle } from "lucide-react";

type HiddenCategory = {
  id: string;
  name: string;
  slug: string;
  updatedAt: string;
  _count: {
    contents: number;
  };
};

type VisibleCategory = {
  id: string;
  name: string;
  slug: string;
};

interface HiddenCategoriesManagerProps {
  categories: HiddenCategory[];
  targetCategories: VisibleCategory[];
}

export const HiddenCategoriesManager = ({
  categories: initialCategories,
  targetCategories,
}: HiddenCategoriesManagerProps) => {
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const [isPending, startTransition] = useTransition();
  const [categories, setCategories] = useState<HiddenCategory[]>(initialCategories);
  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<HiddenCategory | null>(null);
  const [targetCategoryId, setTargetCategoryId] = useState("");

  const handleRestore = async (category: HiddenCategory) => {
    const confirmed = await confirm({
      title: "카테고리 복구",
      message: `"${category.name}" 카테고리를 복구하시겠습니까?\n\n메인 메뉴에 자동으로 추가됩니다.`,
      confirmText: "복구",
      variant: "info",
    });
    if (!confirmed) return;

    startTransition(async () => {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "restore", id: category.id }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        showToast(data.error || "복구에 실패했습니다.", "error");
        return;
      }

      setCategories((prev) => prev.filter((c) => c.id !== category.id));
      showToast(`"${category.name}" 카테고리가 복구되었습니다.`, "success");
    });
  };

  const openMoveModal = (category: HiddenCategory) => {
    setSelectedCategory(category);
    setTargetCategoryId(targetCategories[0]?.id || "");
    setMoveModalOpen(true);
  };

  const handleMoveContents = async () => {
    if (!selectedCategory || !targetCategoryId) return;

    const targetCategory = targetCategories.find((c) => c.id === targetCategoryId);
    if (!targetCategory) return;

    startTransition(async () => {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "moveContents",
          fromCategoryId: selectedCategory.id,
          toCategoryId: targetCategoryId,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        showToast(data.error || "이동에 실패했습니다.", "error");
        return;
      }

      const result = await res.json();
      setCategories((prev) =>
        prev.map((c) =>
          c.id === selectedCategory.id
            ? { ...c, _count: { contents: 0 } }
            : c
        )
      );
      setMoveModalOpen(false);
      setSelectedCategory(null);
      showToast(result.message || "콘텐츠가 이동되었습니다.", "success");
    });
  };

  const handlePermanentDelete = async (category: HiddenCategory) => {
    if (category._count.contents > 0) {
      showToast("콘텐츠가 있는 카테고리는 삭제할 수 없습니다. 먼저 콘텐츠를 이동해주세요.", "error");
      return;
    }

    const confirmed = await confirm({
      title: "영구 삭제",
      message: `"${category.name}" 카테고리를 영구 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`,
      confirmText: "삭제",
      variant: "danger",
    });
    if (!confirmed) return;

    startTransition(async () => {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "permanentDelete", id: category.id }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        showToast(data.error || "삭제에 실패했습니다.", "error");
        return;
      }

      setCategories((prev) => prev.filter((c) => c.id !== category.id));
      showToast(`"${category.name}" 카테고리가 영구 삭제되었습니다.`, "success");
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  if (categories.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
        <FolderX className="w-12 h-12 mx-auto text-gray-300 mb-4" />
        <p className="text-gray-500">숨김 카테고리가 없습니다.</p>
        <p className="text-sm text-gray-400 mt-1">메뉴에서 삭제된 카테고리가 여기에 표시됩니다.</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* 카테고리 목록 */}
        <div className="rounded-xl border border-black/10 bg-white overflow-hidden">
          <div className="divide-y divide-gray-100">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 hover:bg-gray-50/50"
              >
                {/* 아이콘 */}
                <div className="shrink-0 w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                  <FolderX className="w-5 h-5 text-gray-400" />
                </div>

                {/* 정보 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-gray-900">{category.name}</span>
                    <span className="text-xs text-gray-400">/{category.slug}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 flex-wrap">
                    <span className={category._count.contents > 0 ? "text-amber-600 font-medium" : ""}>
                      {category._count.contents > 0 && <AlertTriangle className="w-3 h-3 inline mr-0.5" />}
                      콘텐츠 {category._count.contents}개
                    </span>
                    <span>•</span>
                    <span>숨김: {formatDate(category.updatedAt)}</span>
                  </div>
                </div>

                {/* 액션 버튼 */}
                <div className="flex items-center gap-2 flex-wrap">
                  {category._count.contents > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openMoveModal(category)}
                      disabled={isPending || targetCategories.length === 0}
                      className="text-amber-600 border-amber-200 hover:bg-amber-50"
                    >
                      <ArrowRight className="w-4 h-4 mr-1" />
                      콘텐츠 이동
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRestore(category)}
                    disabled={isPending}
                    className="text-blue-600 border-blue-200 hover:bg-blue-50"
                  >
                    <RotateCcw className="w-4 h-4 mr-1" />
                    복구
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePermanentDelete(category)}
                    disabled={isPending || category._count.contents > 0}
                    className="text-red-600 border-red-200 hover:bg-red-50 disabled:opacity-50"
                    title={category._count.contents > 0 ? "콘텐츠를 먼저 이동해주세요" : ""}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    삭제
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 콘텐츠 이동 모달 */}
      {moveModalOpen && selectedCategory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">콘텐츠 이동</h3>
            <p className="text-sm text-gray-600 mb-4">
              &quot;{selectedCategory.name}&quot; 카테고리의 콘텐츠 {selectedCategory._count.contents}개를
              다른 카테고리로 이동합니다.
            </p>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                이동할 카테고리
              </label>
              <select
                value={targetCategoryId}
                onChange={(e) => setTargetCategoryId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {targetCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} (/{cat.slug})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setMoveModalOpen(false);
                  setSelectedCategory(null);
                }}
                disabled={isPending}
              >
                취소
              </Button>
              <Button
                onClick={handleMoveContents}
                disabled={isPending || !targetCategoryId}
              >
                {isPending ? "이동 중..." : "이동"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
