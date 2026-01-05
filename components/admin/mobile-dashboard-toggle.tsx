"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { Smartphone } from "lucide-react";

interface MobileDashboardToggleProps {
  initialValue: boolean;
}

export default function MobileDashboardToggle({
  initialValue,
}: MobileDashboardToggleProps) {
  const { showToast } = useToast();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [enabled, setEnabled] = useState(initialValue);

  const handleToggle = () => {
    const newValue = !enabled;
    setEnabled(newValue);

    startTransition(async () => {
      const res = await fetch("/api/admin/home-settings/mobile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ showHomeDashboardOnMobile: newValue }),
      });

      if (!res.ok) {
        setEnabled(!newValue);
        const data = await res.json().catch(() => ({}));
        showToast(data.error || "저장에 실패했습니다.", "error");
        return;
      }

      showToast(
        newValue
          ? "모바일에서 대시보드가 표시됩니다."
          : "모바일에서 대시보드가 숨겨집니다.",
        "success"
      );
      router.refresh();
    });
  };

  return (
    <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
            <Smartphone className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h2 className="font-medium">모바일 대시보드 노출</h2>
            <p className="text-sm text-gray-500">
              모바일에서 카테고리/게시판 최신 콘텐츠 대시보드를 표시합니다.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleToggle}
          disabled={isPending}
          className={`relative w-14 h-7 rounded-full transition-colors shrink-0 ${
            enabled ? "bg-blue-500" : "bg-gray-300"
          } ${isPending ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
              enabled ? "translate-x-7" : ""
            }`}
          />
        </button>
      </div>
    </div>
  );
}
