"use client";

import { useMemo, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { BoardManager } from "@/components/admin/board-manager";
import type { MenuItemData } from "@/lib/menus";
import { Plus, GripVertical, ChevronUp, ChevronDown, Trash2, Save, Eye, EyeOff, ExternalLink, Lock } from "lucide-react";

type MenuSection = {
  key: string;
  name: string;
  items: MenuItemData[];
};

interface MenuManagerProps {
  menus: MenuSection[];
  communityEnabled?: boolean;
}

const blankItem = {
  label: "",
  href: "",
  slug: "",
  linkType: "category" as MenuItemData["linkType"],
  isVisible: true,
  isExternal: false,
  openInNew: false,
  requiresAuth: false,
  badgeText: "",
};

const SLUG_PATTERN = /^[a-z0-9-]+$/;

export const MenuManager = ({ menus, communityEnabled = true }: MenuManagerProps) => {
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const normalizedMenus = useMemo(() => {
    const guessType = (item: MenuItemData): MenuItemData["linkType"] => {
      if (item.linkType === "community" || item.linkType === "category") return item.linkType;
      if (item.href?.startsWith("/community")) return "community";
      return "category";
    };
    return menus.map((menu) => ({
      ...menu,
      items: menu.items.map((item) => ({
        ...item,
        linkType: guessType(item),
      })),
    }));
  }, [menus]);
  const [menuState, setMenuState] = useState<MenuSection[]>(normalizedMenus);
  const [drafts, setDrafts] = useState<Record<string, typeof blankItem>>(() =>
    menus.reduce((acc, menu) => ({ ...acc, [menu.key]: { ...blankItem } }), {})
  );
  const [orderDirty, setOrderDirty] = useState<Record<string, boolean>>({});
  const [createOpen, setCreateOpen] = useState<Record<string, boolean>>({});

  const getCategorySlug = (href: string) => {
    if (!href) return "";
    if (href.startsWith("/products/")) {
      return href.replace("/products/", "");
    }
    if (href.startsWith("/community")) {
      return "";
    }
    return href.replace(/^\/+/, "");
  };

  const getCommunitySlug = (href: string, fallbackLabel: string) => {
    if (href?.startsWith("/community/")) {
      return href.replace("/community/", "").trim();
    }
    if (href?.startsWith("/community")) {
      return href.replace("/community", "").replace(/^\/+/, "").trim();
    }
    return fallbackLabel;
  };

  const getNextSequentialSlug = (menuKey: string, linkType: MenuItemData["linkType"]) => {
    const menu = menuState.find((item) => item.key === menuKey);
    if (!menu) return linkType === "community" ? "community-1" : "category-1";
    const prefix = linkType === "community" ? "community" : "category";
    const basePath = linkType === "community" ? "/community/" : "/products/";
    const max = menu.items.reduce((acc, item) => {
      if (item.linkType !== linkType) return acc;
      if (!item.href?.startsWith(basePath)) return acc;
      const slug = item.href.replace(basePath, "").replace(/^\/+/, "");
      const match = slug.match(new RegExp(`^${prefix}-(\\d+)$`));
      if (!match) return acc;
      return Math.max(acc, Number(match[1]));
    }, 0);
    return `${prefix}-${max + 1}`;
  };

  const isSlugDuplicate = (menuKey: string, slug: string, linkType: MenuItemData["linkType"]) => {
    if (!slug) return false;
    const menu = menuState.find((m) => m.key === menuKey);
    if (!menu) return false;
    const basePath = linkType === "community" ? "/community/" : "/products/";
    return menu.items.some((item) => item.href === `${basePath}${slug}`);
  };

  const isSlugValid = (slug: string) => {
    if (!slug) return true;
    return SLUG_PATTERN.test(slug);
  };

  const updateMenuState = (menuKey: string, updater: (items: MenuItemData[]) => MenuItemData[]) => {
    setMenuState((prev) =>
      prev.map((menu) =>
        menu.key === menuKey ? { ...menu, items: updater(menu.items) } : menu
      )
    );
  };

  const handleFieldChange = (
    menuKey: string,
    id: string,
    field: keyof MenuItemData,
    value: string | boolean | undefined
  ) => {
    updateMenuState(menuKey, (items) =>
      items.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleCreate = (menuKey: string) => {
    const payload = drafts[menuKey];
    if (!payload.label.trim()) {
      showToast("메뉴명을 입력해주세요.", "error");
      return;
    }
    const slug = payload.slug?.trim() || getNextSequentialSlug(menuKey, payload.linkType);
    if (!isSlugValid(slug)) {
      showToast("슬러그는 영문 소문자, 숫자, 하이픈만 사용할 수 있습니다.", "error");
      return;
    }
    if (isSlugDuplicate(menuKey, slug, payload.linkType)) {
      showToast("이미 사용 중인 슬러그입니다.", "error");
      return;
    }
    const resolvedHref =
      payload.linkType === "community"
        ? `/community/${slug}`
        : `/products/${slug}`;
    const resolvedPayload = { ...payload, href: resolvedHref, slug };
    const menu = menuState.find((item) => item.key === menuKey);
    const nextOrder = menu ? menu.items.length + 1 : 1;
    startTransition(async () => {
      const res = await fetch("/api/admin/menus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          menuKey,
          data: { ...resolvedPayload, order: nextOrder },
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        showToast(data.error || "메뉴 생성에 실패했습니다.", "error");
        return;
      }
      const item = await res.json();
      updateMenuState(menuKey, (items) => [...items, item]);
      setDrafts((prev) => ({ ...prev, [menuKey]: { ...blankItem } }));
      setCreateOpen((prev) => ({ ...prev, [menuKey]: false }));
      showToast("메뉴가 추가되었습니다.", "success");
    });
  };

  const handleSave = (menuKey: string, item: MenuItemData) => {
    startTransition(async () => {
      const res = await fetch("/api/admin/menus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update",
          id: item.id,
          data: {
            label: item.label,
            href: item.href,
            isVisible: item.isVisible ?? true,
            isExternal: item.isExternal ?? false,
            openInNew: item.openInNew ?? false,
            requiresAuth: item.requiresAuth ?? false,
            badgeText: item.badgeText ?? "",
            linkType: item.linkType ?? "category",
          },
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        showToast(data.error || "메뉴 저장에 실패했습니다.", "error");
        return;
      }
      const updated = await res.json().catch(() => null);
      if (updated?.id) {
        updateMenuState(menuKey, (items) =>
          items.map((current) => (current.id === updated.id ? { ...current, ...updated } : current))
        );
      }
      showToast("저장되었습니다.", "success");
    });
  };

  const handleDelete = (menuKey: string, itemId?: string) => {
    if (!itemId) return;
    if (!confirm("이 메뉴를 삭제할까요?")) return;
    startTransition(async () => {
      const res = await fetch("/api/admin/menus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", id: itemId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        showToast(data.error || "삭제에 실패했습니다.", "error");
        return;
      }
      updateMenuState(menuKey, (items) => items.filter((item) => item.id !== itemId));
      showToast("삭제되었습니다.", "success");
    });
  };

  const handleReorderSave = (menuKey: string) => {
    const menu = menuState.find((item) => item.key === menuKey);
    if (!menu) return;
    const items = menu.items.map((item, index) => ({ id: item.id, order: index + 1 }));
    startTransition(async () => {
      const res = await fetch("/api/admin/menus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reorder", menuKey, items }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        showToast(data.error || "정렬 저장에 실패했습니다.", "error");
        return;
      }
      setOrderDirty((prev) => ({ ...prev, [menuKey]: false }));
      showToast("정렬이 저장되었습니다.", "success");
    });
  };

  const moveItem = (menuKey: string, fromIndex: number, toIndex: number) => {
    updateMenuState(menuKey, (items) => {
      const updated = [...items];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      return updated;
    });
    setOrderDirty((prev) => ({ ...prev, [menuKey]: true }));
  };

  const renderMenuSection = (menu: MenuSection) => {
    return (
      <section key={menu.key} className="space-y-4">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl">{menu.name}</h2>
          <Button
            variant={orderDirty[menu.key] ? "default" : "outline"}
            size="sm"
            onClick={() => handleReorderSave(menu.key)}
            disabled={isPending || !orderDirty[menu.key]}
          >
            정렬 저장
          </Button>
        </div>

        {/* 메뉴 목록 */}
        <div className="rounded-xl border border-black/10 bg-white overflow-hidden">
          {menu.items.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              등록된 메뉴가 없습니다.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {menu.items.map((item, index) => (
                <div
                  key={item.id}
                  draggable
                  onDragStart={(event) => {
                    event.dataTransfer.setData("text/plain", String(index));
                  }}
                  onDragOver={(event) => {
                    event.preventDefault();
                  }}
                  onDrop={(event) => {
                    const fromIndex = Number(event.dataTransfer.getData("text/plain"));
                    if (Number.isNaN(fromIndex)) return;
                    moveItem(menu.key, fromIndex, index);
                  }}
                  className="group"
                >
                  {/* 메인 행 */}
                  <div className="flex items-center gap-3 p-3 hover:bg-gray-50/50">
                    {/* 드래그 핸들 */}
                    <div className="cursor-grab text-gray-300 hover:text-gray-500">
                      <GripVertical className="h-4 w-4" />
                    </div>

                    {/* 순서 번호 */}
                    <div className="w-6 text-center text-xs text-gray-400 font-medium">
                      {index + 1}
                    </div>

                    {/* 메뉴명 */}
                    <div className="w-32 min-w-0">
                      <Input
                        value={item.label}
                        onChange={(event) =>
                          handleFieldChange(menu.key, item.id ?? "", "label", event.target.value)
                        }
                        className="h-8 text-sm"
                        placeholder="메뉴명"
                      />
                    </div>

                    {/* 슬러그 */}
                    <div className="w-28 text-xs text-gray-500 truncate hidden sm:block">
                      {item.linkType === "community"
                        ? getCommunitySlug(item.href, item.label)
                        : getCategorySlug(item.href)}
                    </div>

                    {/* 유형 */}
                    <div className="w-28 hidden md:block">
                      <select
                        value={item.linkType ?? "category"}
                        onChange={(event) => {
                          const nextType = event.target.value as MenuItemData["linkType"];
                          handleFieldChange(menu.key, item.id ?? "", "linkType", nextType);
                          if (nextType === "community") {
                            handleFieldChange(
                              menu.key,
                              item.id ?? "",
                              "href",
                              `/community/${getNextSequentialSlug(menu.key, "community")}`
                            );
                          } else {
                            handleFieldChange(
                              menu.key,
                              item.id ?? "",
                              "href",
                              `/products/${getNextSequentialSlug(menu.key, "category")}`
                            );
                          }
                        }}
                        className="h-8 w-full rounded-md border border-gray-200 bg-white px-2 text-xs focus:outline-none focus:ring-1 focus:ring-gray-300"
                      >
                        <option value="category">상품</option>
                        <option value="community">커뮤니티</option>
                      </select>
                    </div>

                    {/* 옵션 토글들 */}
                    <div className="flex items-center gap-1.5 ml-auto">
                      <button
                        type="button"
                        onClick={() =>
                          handleFieldChange(menu.key, item.id ?? "", "isVisible", !item.isVisible)
                        }
                        className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                          item.isVisible
                            ? "text-green-600 bg-green-50 hover:bg-green-100"
                            : "text-gray-400 bg-gray-100 hover:bg-gray-200"
                        }`}
                      >
                        {item.isVisible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                        {item.isVisible ? "노출" : "숨김"}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleFieldChange(menu.key, item.id ?? "", "openInNew", !item.openInNew)
                        }
                        className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                          item.openInNew
                            ? "text-blue-600 bg-blue-50 hover:bg-blue-100"
                            : "text-gray-400 bg-gray-100 hover:bg-gray-200"
                        }`}
                      >
                        <ExternalLink className="h-3 w-3" />
                        {item.openInNew ? "새탭" : "현재탭"}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleFieldChange(menu.key, item.id ?? "", "requiresAuth", !item.requiresAuth)
                        }
                        className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                          item.requiresAuth
                            ? "text-amber-600 bg-amber-50 hover:bg-amber-100"
                            : "text-gray-400 bg-gray-100 hover:bg-gray-200"
                        }`}
                      >
                        <Lock className="h-3 w-3" />
                        {item.requiresAuth ? "로그인" : "공개"}
                      </button>
                    </div>

                    {/* 순서 버튼 */}
                    <div className="flex items-center gap-0.5">
                      <button
                        type="button"
                        onClick={() => moveItem(menu.key, index, Math.max(0, index - 1))}
                        disabled={index === 0}
                        className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ChevronUp className="h-4 w-4 text-gray-500" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveItem(menu.key, index, Math.min(menu.items.length - 1, index + 1))}
                        disabled={index === menu.items.length - 1}
                        className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                      </button>
                    </div>

                    {/* 액션 버튼 */}
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSave(menu.key, item)}
                        disabled={isPending}
                        className="h-7 px-2 text-xs"
                      >
                        <Save className="h-3.5 w-3.5 mr-1" />
                        저장
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(menu.key, item.id)}
                        disabled={isPending}
                        className="h-7 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1" />
                        삭제
                      </Button>
                    </div>
                  </div>

                  {/* 커뮤니티 하위 게시판 */}
                  {item.linkType === "community" && item.id && (
                    <div className="px-4 pb-4 pt-2 bg-slate-50/50 border-t border-dashed border-gray-200">
                      {!communityEnabled && (
                        <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                          커뮤니티 기능이 비활성화되어 있습니다.
                        </div>
                      )}
                      <BoardManager
                        boards={item.boards ?? []}
                        menuItemId={item.id}
                        groupSlug={getCommunitySlug(item.href, item.label)}
                        disabled={isPending || !communityEnabled}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 새 메뉴 추가 */}
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50/50">
          {!createOpen[menu.key] ? (
            <button
              type="button"
              onClick={() => setCreateOpen((prev) => ({ ...prev, [menu.key]: true }))}
              disabled={isPending}
              className="w-full p-3 flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100/50 transition-colors rounded-xl"
            >
              <Plus className="w-4 h-4" />
              새 메뉴 추가
            </button>
          ) : (
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-3 flex-wrap">
                <Input
                  value={drafts[menu.key]?.label ?? ""}
                  onChange={(event) =>
                    setDrafts((prev) => ({
                      ...prev,
                      [menu.key]: { ...prev[menu.key], label: event.target.value },
                    }))
                  }
                  placeholder="메뉴명"
                  className="w-32 h-9"
                />
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-400">
                    {drafts[menu.key]?.linkType === "community" ? "/community/" : "/products/"}
                  </span>
                  <Input
                    value={drafts[menu.key]?.slug ?? ""}
                    onChange={(event) =>
                      setDrafts((prev) => ({
                        ...prev,
                        [menu.key]: { ...prev[menu.key], slug: event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") },
                      }))
                    }
                    placeholder={getNextSequentialSlug(menu.key, drafts[menu.key]?.linkType ?? "category")}
                    className={`w-36 h-9 ${
                      drafts[menu.key]?.slug && !isSlugValid(drafts[menu.key]?.slug ?? "")
                        ? "border-red-500 focus:ring-red-500"
                        : drafts[menu.key]?.slug && isSlugDuplicate(menu.key, drafts[menu.key]?.slug ?? "", drafts[menu.key]?.linkType ?? "category")
                        ? "border-red-500 focus:ring-red-500"
                        : ""
                    }`}
                  />
                </div>
                <select
                  value={drafts[menu.key]?.linkType ?? "category"}
                  onChange={(event) => {
                    const nextType = event.target.value as MenuItemData["linkType"];
                    setDrafts((prev) => ({
                      ...prev,
                      [menu.key]: {
                        ...prev[menu.key],
                        linkType: nextType,
                        slug: "",
                      },
                    }));
                  }}
                  className="h-9 rounded-md border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-1 focus:ring-gray-300"
                >
                  <option value="category">상품</option>
                  <option value="community">커뮤니티</option>
                </select>
                <Button
                  type="button"
                  onClick={() => handleCreate(menu.key)}
                  disabled={isPending}
                  size="sm"
                >
                  추가
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setDrafts((prev) => ({ ...prev, [menu.key]: { ...blankItem } }));
                    setCreateOpen((prev) => ({ ...prev, [menu.key]: false }));
                  }}
                  disabled={isPending}
                  size="sm"
                >
                  취소
                </Button>
              </div>
              {drafts[menu.key]?.slug && isSlugDuplicate(menu.key, drafts[menu.key]?.slug ?? "", drafts[menu.key]?.linkType ?? "category") && (
                <div className="text-xs text-red-500">이미 사용 중인 슬러그입니다.</div>
              )}
              <div className="text-xs text-gray-400">
                슬러그를 비워두면 자동 생성됩니다. 영문 소문자, 숫자, 하이픈만 사용 가능합니다.
              </div>
            </div>
          )}
        </div>
      </section>
    );
  };

  return <div className="space-y-8">{menuState.map(renderMenuSection)}</div>;
};
