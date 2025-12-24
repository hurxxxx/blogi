"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { RichTextEditor } from "@/components/editor/rich-text-editor";
import { Label } from "@/components/ui/label";

type SocialLink = {
  key: string;
  label: string;
  url: string;
  enabled: boolean;
};

interface FooterSettingsFormProps {
  initialData: {
    footerEnabled: boolean;
    copyrightText?: string | null;
    showCopyright: boolean;
    termsContent?: string | null;
    termsContentMarkdown?: string | null;
    privacyContent?: string | null;
    privacyContentMarkdown?: string | null;
    showTerms: boolean;
    showPrivacy: boolean;
    businessLines: string[];
    showBusinessInfo: boolean;
    socialLinks: { key: string; label: string; url: string }[];
    showSocials: boolean;
  };
}

export const FooterSettingsForm = ({ initialData }: FooterSettingsFormProps) => {
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [footerEnabled, setFooterEnabled] = useState(initialData.footerEnabled);
  const [copyrightText, setCopyrightText] = useState(initialData.copyrightText ?? "");
  const [showCopyright, setShowCopyright] = useState(initialData.showCopyright);
  const [termsContent, setTermsContent] = useState(initialData.termsContent ?? "");
  const [termsContentMarkdown, setTermsContentMarkdown] = useState(
    initialData.termsContentMarkdown ?? ""
  );
  const [privacyContent, setPrivacyContent] = useState(initialData.privacyContent ?? "");
  const [privacyContentMarkdown, setPrivacyContentMarkdown] = useState(
    initialData.privacyContentMarkdown ?? ""
  );
  const [showTerms, setShowTerms] = useState(initialData.showTerms);
  const [showPrivacy, setShowPrivacy] = useState(initialData.showPrivacy);
  const [businessLines, setBusinessLines] = useState<string[]>(() => {
    const lines = initialData.businessLines.slice(0, 4);
    return lines.length > 0 ? [...lines, "", "", "", ""].slice(0, 4) : ["", "", "", ""];
  });
  const [showBusinessInfo, setShowBusinessInfo] = useState(initialData.showBusinessInfo);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(() => {
    const preset = [
      { key: "instagram", label: "Instagram" },
      { key: "facebook", label: "Facebook" },
      { key: "youtube", label: "YouTube" },
      { key: "tiktok", label: "TikTok" },
      { key: "telegram", label: "Telegram" },
      { key: "kakao", label: "KakaoTalk" },
      { key: "x", label: "X" },
    ];
    return preset.map((item) => {
      const existing = initialData.socialLinks.find((link) => link.key === item.key);
      return {
        key: item.key,
        label: item.label,
        url: existing?.url ?? "",
        enabled: Boolean(existing?.url),
      };
    });
  });
  const [showSocials, setShowSocials] = useState(initialData.showSocials);

  const updateSocial = (index: number, field: keyof SocialLink, value: string | boolean) => {
    setSocialLinks((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    startTransition(async () => {
      const payload = {
        footerEnabled,
        copyrightText: copyrightText.trim() || null,
        showCopyright,
        termsContent: termsContent || null,
        termsContentMarkdown: termsContentMarkdown || null,
        privacyContent: privacyContent || null,
        privacyContentMarkdown: privacyContentMarkdown || null,
        showTerms,
        showPrivacy,
        businessLines: businessLines.map((line) => line.trim()).filter(Boolean),
        showBusinessInfo,
        showSocials,
        socialLinks: socialLinks
          .filter((item) => item.enabled && item.url.trim())
          .map((item) => ({
            key: item.key,
            label: item.label,
            url: item.url.trim(),
          })),
      };
      const res = await fetch("/api/admin/footer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        showToast(data.error || "저장에 실패했습니다.", "error");
        return;
      }
      showToast("푸터 정보가 저장되었습니다.", "success");
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <section className="space-y-4">
        <h2 className="font-display text-2xl">저작권 표시</h2>
        <Input
          value={copyrightText}
          onChange={(event) => setCopyrightText(event.target.value)}
          placeholder="예) Copyright © Danang VIP Tour. All rights reserved."
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={showCopyright}
            onChange={(event) => setShowCopyright(event.target.checked)}
          />
          저작권 문구 노출
        </label>
      </section>
      <section className="space-y-4">
        <h2 className="font-display text-2xl">기본 설정</h2>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={footerEnabled}
            onChange={(event) => setFooterEnabled(event.target.checked)}
          />
          푸터 전체 노출
        </label>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl">이용약관</h2>
        <div className="space-y-2">
          <Label>내용</Label>
          <RichTextEditor
            content={termsContent}
            onChange={setTermsContent}
            onMarkdownChange={setTermsContentMarkdown}
            placeholder="이용약관 내용을 입력하세요..."
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={showTerms}
            onChange={(event) => setShowTerms(event.target.checked)}
          />
          이용약관 노출
        </label>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl">개인정보처리방침</h2>
        <div className="space-y-2">
          <Label>내용</Label>
          <RichTextEditor
            content={privacyContent}
            onChange={setPrivacyContent}
            onMarkdownChange={setPrivacyContentMarkdown}
            placeholder="개인정보처리방침 내용을 입력하세요..."
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={showPrivacy}
            onChange={(event) => setShowPrivacy(event.target.checked)}
          />
          개인정보처리방침 노출
        </label>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl">사업자 정보</h2>
        <div className="grid gap-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Input
              key={`business-line-${index}`}
              value={businessLines[index] ?? ""}
              onChange={(event) =>
                setBusinessLines((prev) => {
                  const updated = [...prev];
                  updated[index] = event.target.value;
                  return updated;
                })
              }
              placeholder={`라인 ${index + 1}`}
            />
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={showBusinessInfo}
            onChange={(event) => setShowBusinessInfo(event.target.checked)}
          />
          사업자 정보 노출
        </label>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl">소셜 링크</h2>
        <div className="space-y-3">
          {socialLinks.map((item, index) => (
            <div key={item.key} className="grid gap-3 sm:grid-cols-[140px_1fr_auto] items-center">
              <div className="text-sm font-medium">{item.label}</div>
              <Input
                value={item.url}
                onChange={(event) => updateSocial(index, "url", event.target.value)}
                placeholder="https://"
              />
              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={item.enabled}
                  onChange={(event) => updateSocial(index, "enabled", event.target.checked)}
                />
                노출
              </label>
            </div>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={showSocials}
            onChange={(event) => setShowSocials(event.target.checked)}
          />
          소셜 링크 전체 노출
        </label>
      </section>

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending ? "저장 중..." : "저장"}
        </Button>
      </div>
    </form>
  );
};
