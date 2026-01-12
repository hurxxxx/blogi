// 테마 프리셋 정의
export interface ThemeColors {
  headerBg: string;
  headerText: string;
  footerBg: string;
  footerText: string;
  primary: string;
  accent: string;
  contentBg: string;
}

export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  colors: ThemeColors;
}

export const themePresets: ThemePreset[] = [
  {
    id: "classic-navy",
    name: "Classic Navy",
    description: "기존 다크 네이비 테마",
    colors: {
      headerBg: "#0b1320",
      headerText: "#ffffff",
      footerBg: "#0b1320",
      footerText: "#ffffff",
      primary: "#3b82f6",
      accent: "#f97316",
      contentBg: "#ffffff",
    },
  },
  {
    id: "ocean-teal",
    name: "Ocean Teal",
    description: "2026 트렌드 블루-그린",
    colors: {
      headerBg: "#0d4f4f",
      headerText: "#ffffff",
      footerBg: "#0d4f4f",
      footerText: "#ffffff",
      primary: "#14b8a6",
      accent: "#fbbf24",
      contentBg: "#f0fdfa",
    },
  },
  {
    id: "mocha-brown",
    name: "Mocha Brown",
    description: "따뜻한 모카 브라운",
    colors: {
      headerBg: "#3d2b1f",
      headerText: "#fef3c7",
      footerBg: "#3d2b1f",
      footerText: "#fef3c7",
      primary: "#92400e",
      accent: "#f59e0b",
      contentBg: "#fffbeb",
    },
  },
  {
    id: "forest-green",
    name: "Forest Green",
    description: "프리미엄 포레스트 그린",
    colors: {
      headerBg: "#1a3c34",
      headerText: "#ffffff",
      footerBg: "#1a3c34",
      footerText: "#ffffff",
      primary: "#059669",
      accent: "#fbbf24",
      contentBg: "#f0fdf4",
    },
  },
  {
    id: "soft-lavender",
    name: "Soft Lavender",
    description: "부드러운 라벤더 파스텔",
    colors: {
      headerBg: "#4a4063",
      headerText: "#ffffff",
      footerBg: "#4a4063",
      footerText: "#ffffff",
      primary: "#8b5cf6",
      accent: "#ec4899",
      contentBg: "#faf5ff",
    },
  },
  {
    id: "cloud-light",
    name: "Cloud Light",
    description: "밝고 깨끗한 미니멀",
    colors: {
      headerBg: "#f5f5f0",
      headerText: "#1f2937",
      footerBg: "#f5f5f0",
      footerText: "#1f2937",
      primary: "#3b82f6",
      accent: "#f43f5e",
      contentBg: "#ffffff",
    },
  },
  {
    id: "slate-modern",
    name: "Slate Modern",
    description: "모던 슬레이트 다크",
    colors: {
      headerBg: "#2d3748",
      headerText: "#ffffff",
      footerBg: "#2d3748",
      footerText: "#ffffff",
      primary: "#6366f1",
      accent: "#06b6d4",
      contentBg: "#f8fafc",
    },
  },
  {
    id: "warm-sand",
    name: "Warm Sand",
    description: "자연스러운 따뜻한 샌드",
    colors: {
      headerBg: "#5c4d3c",
      headerText: "#fef3c7",
      footerBg: "#5c4d3c",
      footerText: "#fef3c7",
      primary: "#b45309",
      accent: "#65a30d",
      contentBg: "#fefce8",
    },
  },
  // 밝은 테마들
  {
    id: "pure-white",
    name: "Pure White",
    description: "순백의 깔끔한 화이트",
    colors: {
      headerBg: "#ffffff",
      headerText: "#111827",
      footerBg: "#ffffff",
      footerText: "#111827",
      primary: "#2563eb",
      accent: "#dc2626",
      contentBg: "#ffffff",
    },
  },
  {
    id: "soft-gray",
    name: "Soft Gray",
    description: "부드러운 그레이 모노톤",
    colors: {
      headerBg: "#f3f4f6",
      headerText: "#374151",
      footerBg: "#e5e7eb",
      footerText: "#374151",
      primary: "#4b5563",
      accent: "#6b7280",
      contentBg: "#f9fafb",
    },
  },
  {
    id: "cream-beige",
    name: "Cream Beige",
    description: "따뜻한 크림 베이지",
    colors: {
      headerBg: "#faf7f2",
      headerText: "#44403c",
      footerBg: "#f5f0e8",
      footerText: "#44403c",
      primary: "#a16207",
      accent: "#b45309",
      contentBg: "#fffdf9",
    },
  },
  {
    id: "ice-blue",
    name: "Ice Blue",
    description: "시원한 아이스 블루",
    colors: {
      headerBg: "#f0f9ff",
      headerText: "#0c4a6e",
      footerBg: "#e0f2fe",
      footerText: "#0c4a6e",
      primary: "#0284c7",
      accent: "#0891b2",
      contentBg: "#f8fafc",
    },
  },
];

// 프리셋 ID로 테마 찾기
export function getThemePreset(presetId: string): ThemePreset | undefined {
  return themePresets.find((preset) => preset.id === presetId);
}

// 기본 테마 (classic-navy)
export function getDefaultTheme(): ThemePreset {
  return themePresets[0];
}

// WCAG 대비율 계산 (4.5:1 이상이면 AA 통과)
export function getContrastRatio(color1: string, color2: string): number {
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

// 상대 휘도 계산
function getLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;

  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((v) => {
    v = v / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// HEX를 RGB로 변환
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

// WCAG AA 기준 통과 여부 (4.5:1)
export function meetsContrastRequirement(bg: string, text: string): boolean {
  return getContrastRatio(bg, text) >= 4.5;
}

// 대비율에 따른 상태 반환
export function getContrastStatus(bg: string, text: string): "good" | "warning" | "error" {
  const ratio = getContrastRatio(bg, text);
  if (ratio >= 4.5) return "good";
  if (ratio >= 3) return "warning";
  return "error";
}

// 배경색에 대해 더 읽기 쉬운 텍스트 색이 흰색인지 여부
export function prefersLightText(bg: string): boolean {
  const whiteContrast = getContrastRatio(bg, "#ffffff");
  const darkContrast = getContrastRatio(bg, "#111827");
  return whiteContrast >= darkContrast;
}

// 테마 타입
export type ThemePresetId = typeof themePresets[number]["id"];
