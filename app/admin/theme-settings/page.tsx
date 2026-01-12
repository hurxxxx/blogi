"use client";

import { useEffect, useState, useCallback } from "react";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, RefreshCw, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  type ThemePreset,
  type ThemeColors,
  getContrastStatus,
  getContrastRatio,
  prefersLightText,
} from "@/lib/theme-presets";

interface ThemeSettings {
  themePreset: string;
  customHeaderBg: string | null;
  customHeaderText: string | null;
  customHeaderSiteNameText: string | null;
  customHeaderMenuText: string | null;
  customFooterBg: string | null;
  customFooterText: string | null;
  customPrimary: string | null;
  customAccent: string | null;
  customContentBg: string | null;
  customButtonText: string | null;
}

export default function ThemeSettingsPage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [presets, setPresets] = useState<ThemePreset[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<string>("classic-navy");
  const [customColors, setCustomColors] = useState<Partial<ThemeColors>>({});
  const [useCustomFooter, setUseCustomFooter] = useState(false);

  // 현재 적용된 색상 계산
  const getCurrentColors = useCallback((): ThemeColors => {
    const preset = presets.find((p) => p.id === selectedPreset);
    const presetColors = preset?.colors ?? {
      headerBg: "#0b1320",
      headerText: "#ffffff",
      headerSiteNameText: "#ffffff",
      headerMenuText: "#ffffff",
      footerBg: "#0b1320",
      footerText: "#ffffff",
      primary: "#3b82f6",
      accent: "#f97316",
      contentBg: "#ffffff",
      buttonText: "#3b82f6",
    };

    return {
      headerBg: customColors.headerBg ?? presetColors.headerBg,
      headerText: customColors.headerText ?? presetColors.headerText,
      headerSiteNameText: customColors.headerSiteNameText ?? presetColors.headerSiteNameText,
      headerMenuText: customColors.headerMenuText ?? presetColors.headerMenuText,
      footerBg: useCustomFooter
        ? (customColors.footerBg ?? presetColors.footerBg)
        : (customColors.headerBg ?? presetColors.headerBg),
      footerText: useCustomFooter
        ? (customColors.footerText ?? presetColors.footerText)
        : (customColors.headerText ?? presetColors.headerText),
      primary: customColors.primary ?? presetColors.primary,
      accent: customColors.accent ?? presetColors.accent,
      contentBg: customColors.contentBg ?? presetColors.contentBg,
      buttonText: customColors.buttonText ?? presetColors.buttonText,
    };
  }, [presets, selectedPreset, customColors, useCustomFooter]);

  // 데이터 로드
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/admin/theme-settings");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();

        setPresets(data.presets);
        setSelectedPreset(data.settings.themePreset);

        // 커스텀 색상 설정
        const custom: Partial<ThemeColors> = {};
        if (data.settings.customHeaderBg) custom.headerBg = data.settings.customHeaderBg;
        if (data.settings.customHeaderText) custom.headerText = data.settings.customHeaderText;
        if (data.settings.customHeaderSiteNameText) {
          custom.headerSiteNameText = data.settings.customHeaderSiteNameText;
        }
        if (data.settings.customHeaderMenuText) {
          custom.headerMenuText = data.settings.customHeaderMenuText;
        }
        if (data.settings.customFooterBg) custom.footerBg = data.settings.customFooterBg;
        if (data.settings.customFooterText) custom.footerText = data.settings.customFooterText;
        if (data.settings.customPrimary) custom.primary = data.settings.customPrimary;
        if (data.settings.customAccent) custom.accent = data.settings.customAccent;
        if (data.settings.customContentBg) custom.contentBg = data.settings.customContentBg;
        if (data.settings.customButtonText) custom.buttonText = data.settings.customButtonText;
        setCustomColors(custom);

        // 푸터 별도 설정 여부
        setUseCustomFooter(
          !!(data.settings.customFooterBg || data.settings.customFooterText)
        );
      } catch {
        showToast("테마 설정을 불러오는데 실패했습니다", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [showToast]);

  // 프리셋 선택
  const handlePresetSelect = (presetId: string) => {
    setSelectedPreset(presetId);
    // 프리셋 변경 시 커스텀 색상 초기화
    setCustomColors({});
    setUseCustomFooter(false);
  };

  // 커스텀 색상 변경
  const handleColorChange = (key: keyof ThemeColors, value: string) => {
    setCustomColors((prev) => ({ ...prev, [key]: value }));
  };

  // 프리셋으로 초기화
  const resetToPreset = () => {
    setCustomColors({});
    setUseCustomFooter(false);
  };

  // 저장
  const handleSave = async () => {
    setSaving(true);
    try {
      const colors = getCurrentColors();
      const res = await fetch("/api/admin/theme-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          themePreset: selectedPreset,
          customHeaderBg: customColors.headerBg ?? null,
          customHeaderText: customColors.headerText ?? null,
          customHeaderSiteNameText: customColors.headerSiteNameText ?? null,
          customHeaderMenuText: customColors.headerMenuText ?? null,
          customFooterBg: useCustomFooter ? (customColors.footerBg ?? colors.footerBg) : null,
          customFooterText: useCustomFooter ? (customColors.footerText ?? colors.footerText) : null,
          customPrimary: customColors.primary ?? null,
          customAccent: customColors.accent ?? null,
          customContentBg: customColors.contentBg ?? null,
          customButtonText: customColors.buttonText ?? null,
        }),
      });

      if (!res.ok) throw new Error("Failed to save");
      showToast("테마 설정이 저장되었습니다", "success");
    } catch {
      showToast("저장에 실패했습니다", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  const currentColors = getCurrentColors();
  const headerContrast = getContrastStatus(currentColors.headerBg, currentColors.headerText);
  const footerContrast = getContrastStatus(currentColors.footerBg, currentColors.footerText);
  const defaultButtonText = prefersLightText(currentColors.primary) ? "#ffffff" : "#111827";
  const buttonTextValue =
    customColors.buttonText ??
    (currentColors.buttonText || defaultButtonText);
  const primaryForeground = buttonTextValue;
  const accentForeground = buttonTextValue;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">테마 설정</h1>
        <p className="text-gray-600 mt-1">
          사이트의 헤더, 푸터, 버튼 색상을 변경합니다
        </p>
      </div>

      {/* 프리셋 선택 */}
      <section className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">프리셋 선택</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {presets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handlePresetSelect(preset.id)}
              className={cn(
                "relative rounded-xl border-2 p-3 transition-all hover:shadow-md",
                selectedPreset === preset.id
                  ? "border-blue-500 ring-2 ring-blue-200"
                  : "border-gray-200 hover:border-gray-300"
              )}
            >
              {/* 색상 미리보기 */}
              <div className="aspect-[4/3] rounded-lg overflow-hidden mb-2">
                <div
                  className="h-1/4"
                  style={{ backgroundColor: preset.colors.headerBg }}
                />
                <div
                  className="h-2/4 flex items-center justify-center gap-2 p-2"
                  style={{ backgroundColor: preset.colors.contentBg }}
                >
                  <div
                    className="h-4 w-12 rounded"
                    style={{ backgroundColor: preset.colors.primary }}
                  />
                  <div
                    className="h-4 w-8 rounded"
                    style={{ backgroundColor: preset.colors.accent }}
                  />
                </div>
                <div
                  className="h-1/4"
                  style={{ backgroundColor: preset.colors.footerBg }}
                />
              </div>
              <span className="text-sm font-medium">{preset.name}</span>
              {selectedPreset === preset.id && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* 커스텀 색상 조정 */}
      <section className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">커스텀 색상 조정</h2>
          <Button variant="outline" size="sm" onClick={resetToPreset}>
            <RefreshCw className="w-4 h-4 mr-2" />
            프리셋으로 초기화
          </Button>
        </div>

        <div className="grid gap-6">
          {/* 헤더 색상 */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>헤더 배경색</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  type="color"
                  value={customColors.headerBg ?? currentColors.headerBg}
                  onChange={(e) => handleColorChange("headerBg", e.target.value)}
                  className="w-12 h-10 p-1 cursor-pointer"
                />
                <Input
                  type="text"
                  value={customColors.headerBg ?? currentColors.headerBg}
                  onChange={(e) => handleColorChange("headerBg", e.target.value)}
                  placeholder="#0b1320"
                  className="flex-1"
                />
              </div>
            </div>
            <div>
              <Label className="flex items-center gap-2">
                헤더 텍스트색
                {headerContrast !== "good" && (
                  <span
                    className={cn(
                      "text-xs px-2 py-0.5 rounded-full flex items-center gap-1",
                      headerContrast === "warning"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    )}
                  >
                    <AlertTriangle className="w-3 h-3" />
                    {headerContrast === "warning" ? "대비 주의" : "대비 부족"}
                  </span>
                )}
              </Label>
              <div className="flex gap-2 mt-1">
                <Input
                  type="color"
                  value={customColors.headerText ?? currentColors.headerText}
                  onChange={(e) => handleColorChange("headerText", e.target.value)}
                  className="w-12 h-10 p-1 cursor-pointer"
                />
                <Input
                  type="text"
                  value={customColors.headerText ?? currentColors.headerText}
                  onChange={(e) => handleColorChange("headerText", e.target.value)}
                  placeholder="#ffffff"
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                대비율: {getContrastRatio(currentColors.headerBg, currentColors.headerText).toFixed(2)}:1
                (권장 4.5:1 이상)
              </p>
            </div>
            <div>
              <Label>사이트 이름 색상</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  type="color"
                  value={customColors.headerSiteNameText ?? currentColors.headerSiteNameText}
                  onChange={(e) => handleColorChange("headerSiteNameText", e.target.value)}
                  className="w-12 h-10 p-1 cursor-pointer"
                />
                <Input
                  type="text"
                  value={customColors.headerSiteNameText ?? currentColors.headerSiteNameText}
                  onChange={(e) => handleColorChange("headerSiteNameText", e.target.value)}
                  placeholder="#ffffff"
                  className="flex-1"
                />
              </div>
            </div>
            <div>
              <Label>메뉴 텍스트 색상</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  type="color"
                  value={customColors.headerMenuText ?? currentColors.headerMenuText}
                  onChange={(e) => handleColorChange("headerMenuText", e.target.value)}
                  className="w-12 h-10 p-1 cursor-pointer"
                />
                <Input
                  type="text"
                  value={customColors.headerMenuText ?? currentColors.headerMenuText}
                  onChange={(e) => handleColorChange("headerMenuText", e.target.value)}
                  placeholder="#ffffff"
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          {/* 푸터 색상 */}
          <div className="border-t pt-4">
            <div className="flex items-center gap-2 mb-4">
              <input
                type="checkbox"
                id="useCustomFooter"
                checked={useCustomFooter}
                onChange={(e) => setUseCustomFooter(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="useCustomFooter" className="cursor-pointer">
                푸터 색상을 헤더와 다르게 설정
              </Label>
            </div>

            {useCustomFooter && (
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>푸터 배경색</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      type="color"
                      value={customColors.footerBg ?? currentColors.footerBg}
                      onChange={(e) => handleColorChange("footerBg", e.target.value)}
                      className="w-12 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={customColors.footerBg ?? currentColors.footerBg}
                      onChange={(e) => handleColorChange("footerBg", e.target.value)}
                      placeholder="#0b1320"
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <Label className="flex items-center gap-2">
                    푸터 텍스트색
                    {footerContrast !== "good" && (
                      <span
                        className={cn(
                          "text-xs px-2 py-0.5 rounded-full flex items-center gap-1",
                          footerContrast === "warning"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        )}
                      >
                        <AlertTriangle className="w-3 h-3" />
                        {footerContrast === "warning" ? "대비 주의" : "대비 부족"}
                      </span>
                    )}
                  </Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      type="color"
                      value={customColors.footerText ?? currentColors.footerText}
                      onChange={(e) => handleColorChange("footerText", e.target.value)}
                      className="w-12 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={customColors.footerText ?? currentColors.footerText}
                      onChange={(e) => handleColorChange("footerText", e.target.value)}
                      placeholder="#ffffff"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Primary / Accent 색상 */}
          <div className="border-t pt-4 grid sm:grid-cols-2 gap-4">
            <div>
              <Label>Primary 색상 (버튼, 링크)</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  type="color"
                  value={customColors.primary ?? currentColors.primary}
                  onChange={(e) => handleColorChange("primary", e.target.value)}
                  className="w-12 h-10 p-1 cursor-pointer"
                />
                <Input
                  type="text"
                  value={customColors.primary ?? currentColors.primary}
                  onChange={(e) => handleColorChange("primary", e.target.value)}
                  placeholder="#3b82f6"
                  className="flex-1"
                />
              </div>
            </div>
            <div>
              <Label>Accent 색상 (강조)</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  type="color"
                  value={customColors.accent ?? currentColors.accent}
                  onChange={(e) => handleColorChange("accent", e.target.value)}
                  className="w-12 h-10 p-1 cursor-pointer"
                />
                <Input
                  type="text"
                  value={customColors.accent ?? currentColors.accent}
                  onChange={(e) => handleColorChange("accent", e.target.value)}
                  placeholder="#f97316"
                  className="flex-1"
                />
              </div>
            </div>
            <div>
              <Label>버튼 라벨 색상</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  type="color"
                  value={buttonTextValue}
                  onChange={(e) => handleColorChange("buttonText", e.target.value)}
                  className="w-12 h-10 p-1 cursor-pointer"
                />
                <Input
                  type="text"
                  value={buttonTextValue}
                  onChange={(e) => handleColorChange("buttonText", e.target.value)}
                  placeholder="#3b82f6"
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          {/* 콘텐츠 배경 */}
          <div className="border-t pt-4">
            <div>
              <Label>콘텐츠 배경색</Label>
              <div className="flex gap-2 mt-1 max-w-xs">
                <Input
                  type="color"
                  value={customColors.contentBg ?? currentColors.contentBg}
                  onChange={(e) => handleColorChange("contentBg", e.target.value)}
                  className="w-12 h-10 p-1 cursor-pointer"
                />
                <Input
                  type="text"
                  value={customColors.contentBg ?? currentColors.contentBg}
                  onChange={(e) => handleColorChange("contentBg", e.target.value)}
                  placeholder="#ffffff"
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 미리보기 */}
      <section className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">실시간 미리보기</h2>
        <div
          className="border rounded-xl overflow-hidden"
          style={
            {
              "--theme-header-bg": currentColors.headerBg,
              "--theme-header-text": currentColors.headerText,
              "--theme-header-site-name-text": currentColors.headerSiteNameText,
              "--theme-header-menu-text": currentColors.headerMenuText,
              "--primary": currentColors.primary,
              "--primary-foreground": primaryForeground,
              "--accent": currentColors.accent,
              "--accent-foreground": accentForeground,
              "--theme-button-text": buttonTextValue,
            } as React.CSSProperties
          }
        >
          {/* 헤더 미리보기 */}
          <div
            className="p-4 flex items-center justify-between"
            style={{
              backgroundColor: "var(--theme-header-bg)",
            }}
          >
            <span className="font-semibold text-[color:var(--theme-header-site-name-text)]">사이트 이름</span>
            <div className="flex gap-4 text-sm text-[color:var(--theme-header-menu-text)]">
              <span className="opacity-70">메뉴1</span>
              <span className="opacity-70">메뉴2</span>
              <span className="opacity-70">메뉴3</span>
            </div>
          </div>

          {/* 콘텐츠 미리보기 */}
          <div
            className="p-6 min-h-[120px]"
            style={{ backgroundColor: currentColors.contentBg }}
          >
            <p className="text-gray-700 mb-4">콘텐츠 영역 미리보기</p>
            <div className="flex gap-3">
              <Button size="sm">
                Primary 버튼
              </Button>
              <Button size="sm" variant="accent">
                Accent 버튼
              </Button>
            </div>
          </div>

          {/* 푸터 미리보기 */}
          <div
            className="p-4 text-center text-sm"
            style={{
              backgroundColor: currentColors.footerBg,
              color: currentColors.footerText,
            }}
          >
            <span style={{ opacity: 0.7 }}>
              Copyright 2026. All rights reserved.
            </span>
          </div>
        </div>
      </section>

      {/* 저장 버튼 */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg">
          {saving ? "저장 중..." : "저장"}
        </Button>
      </div>
    </div>
  );
}
