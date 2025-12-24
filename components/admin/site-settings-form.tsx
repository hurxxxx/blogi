"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

interface SiteSettingsFormProps {
  initialData: {
    siteName?: string | null;
    siteLogoUrl?: string | null;
  };
}

export const SiteSettingsForm = ({ initialData }: SiteSettingsFormProps) => {
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [siteName, setSiteName] = useState(initialData.siteName ?? "");
  const [siteLogoUrl, setSiteLogoUrl] = useState(initialData.siteLogoUrl ?? "");
  const [uploading, setUploading] = useState(false);

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("scope", "branding");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        showToast(data.error || "로고 업로드에 실패했습니다.", "error");
        return;
      }
      const data = await res.json();
      setSiteLogoUrl(data.url);
      showToast("로고가 업로드되었습니다.", "success");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    startTransition(async () => {
      const payload = {
        siteName: siteName.trim() || null,
        siteLogoUrl: siteLogoUrl.trim() || null,
      };
      const res = await fetch("/api/admin/site-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        showToast(data.error || "저장에 실패했습니다.", "error");
        return;
      }
      showToast("사이트 정보가 저장되었습니다.", "success");
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium">사이트 이름</label>
        <Input
          value={siteName}
          onChange={(event) => setSiteName(event.target.value)}
          placeholder="사이트 이름"
          disabled={isPending}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">로고 URL</label>
        <Input
          value={siteLogoUrl}
          onChange={(event) => setSiteLogoUrl(event.target.value)}
          placeholder="로고 URL"
          disabled={isPending}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">로고 업로드</label>
        <Input type="file" accept="image/*" onChange={handleLogoUpload} disabled={isPending} />
        {uploading && <div className="text-xs text-gray-500">업로드 중...</div>}
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending ? "저장 중..." : "저장"}
        </Button>
      </div>
    </form>
  );
};
