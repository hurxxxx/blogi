// 테마 프리셋 정의
export interface ThemeColors {
  headerBg: string;
  headerText: string;
  headerSiteNameText: string;
  headerMenuText: string;
  footerBg: string;
  footerText: string;
  primary: string;
  accent: string;
  contentBg: string;
  buttonText: string;
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
    description: "다크 네이비 테마",
    colors: {
      headerBg: "#0b1320",
      headerText: "#ffffff",
      headerSiteNameText: "#ffffff",
      headerMenuText: "#ffffff",
      footerBg: "#0b1320",
      footerText: "#ffffff",
      primary: "#3b82f6",
      accent: "#f97316",
      contentBg: "#ffffff",
      buttonText: "#ffffff",
    },
  },
  {
    id: "ocean-teal",
    name: "Ocean Teal",
    description: "2026 Transformative Teal 인스파이어",
    colors: {
      headerBg: "#2f6f72",
      headerText: "#f8fbfb",
      headerSiteNameText: "#f8fbfb",
      headerMenuText: "#f8fbfb",
      footerBg: "#2f6f72",
      footerText: "#f8fbfb",
      primary: "#1f978f",
      accent: "#c9825a",
      contentBg: "#eef7f6",
      buttonText: "#ffffff",
    },
  },
  {
    id: "mocha-brown",
    name: "Mocha Brown",
    description: "2026 Silhouette 계열의 테일러드 브라운",
    colors: {
      headerBg: "#3a2b24",
      headerText: "#f6efe6",
      headerSiteNameText: "#f6efe6",
      headerMenuText: "#f6efe6",
      footerBg: "#3a2b24",
      footerText: "#f6efe6",
      primary: "#8c5a3f",
      accent: "#c06c45",
      contentBg: "#fbf5ef",
      buttonText: "#ffffff",
    },
  },
  {
    id: "forest-green",
    name: "Forest Green",
    description: "Narragansett Green 톤의 클래식 그린",
    colors: {
      headerBg: "#2b4a3f",
      headerText: "#f5f7f6",
      headerSiteNameText: "#f5f7f6",
      headerMenuText: "#f5f7f6",
      footerBg: "#2b4a3f",
      footerText: "#f5f7f6",
      primary: "#2f7b6b",
      accent: "#b86b4a",
      contentBg: "#f1f6f4",
      buttonText: "#ffffff",
    },
  },
  {
    id: "soft-lavender",
    name: "Soft Lavender",
    description: "Batik/First Crush 계열의 로지 라벤더",
    colors: {
      headerBg: "#59445f",
      headerText: "#f9f4f7",
      headerSiteNameText: "#f9f4f7",
      headerMenuText: "#f9f4f7",
      footerBg: "#59445f",
      footerText: "#f9f4f7",
      primary: "#8b5f8f",
      accent: "#c46b8c",
      contentBg: "#fbf5f8",
      buttonText: "#ffffff",
    },
  },
  {
    id: "cloud-light",
    name: "Cloud Light",
    description: "Swiss Coffee 계열의 따뜻한 미니멀",
    colors: {
      headerBg: "#f4f1ea",
      headerText: "#3a322b",
      headerSiteNameText: "#3a322b",
      headerMenuText: "#3a322b",
      footerBg: "#f4f1ea",
      footerText: "#3a322b",
      primary: "#8a6b54",
      accent: "#c88a5c",
      contentBg: "#fffaf4",
      buttonText: "#ffffff",
    },
  },
  {
    id: "slate-modern",
    name: "Slate Modern",
    description: "테일러드 차콜 & 딥 슬레이트",
    colors: {
      headerBg: "#2f353a",
      headerText: "#f4f6f8",
      headerSiteNameText: "#f4f6f8",
      headerMenuText: "#f4f6f8",
      footerBg: "#2f353a",
      footerText: "#f4f6f8",
      primary: "#4f6f7a",
      accent: "#b07c5d",
      contentBg: "#f5f7f8",
      buttonText: "#ffffff",
    },
  },
  {
    id: "warm-sand",
    name: "Warm Sand",
    description: "Sherwood Tan & Southwest Pottery 톤",
    colors: {
      headerBg: "#6d523d",
      headerText: "#f8efe4",
      headerSiteNameText: "#f8efe4",
      headerMenuText: "#f8efe4",
      footerBg: "#6d523d",
      footerText: "#f8efe4",
      primary: "#c36a42",
      accent: "#8f6b4e",
      contentBg: "#fdf6ef",
      buttonText: "#ffffff",
    },
  },
  // 밝은 테마들
  {
    id: "pure-white",
    name: "Pure White",
    description: "모던 화이트 + 틸 포인트",
    colors: {
      headerBg: "#ffffff",
      headerText: "#2b2f33",
      headerSiteNameText: "#2b2f33",
      headerMenuText: "#2b2f33",
      footerBg: "#ffffff",
      footerText: "#2b2f33",
      primary: "#0f8f8a",
      accent: "#c9825a",
      contentBg: "#ffffff",
      buttonText: "#ffffff",
    },
  },
  {
    id: "soft-gray",
    name: "Soft Gray",
    description: "테일러드 그레이 + 웜 포인트",
    colors: {
      headerBg: "#ece9e3",
      headerText: "#3d4246",
      headerSiteNameText: "#3d4246",
      headerMenuText: "#3d4246",
      footerBg: "#e4e0da",
      footerText: "#3d4246",
      primary: "#5f7480",
      accent: "#b28464",
      contentBg: "#f7f5f1",
      buttonText: "#ffffff",
    },
  },
  {
    id: "cream-beige",
    name: "Cream Beige",
    description: "크림 베이지 + 클레이 포인트",
    colors: {
      headerBg: "#f6efe4",
      headerText: "#4a3d33",
      headerSiteNameText: "#4a3d33",
      headerMenuText: "#4a3d33",
      footerBg: "#efe6d8",
      footerText: "#4a3d33",
      primary: "#a6714d",
      accent: "#d09b6a",
      contentBg: "#fff8f0",
      buttonText: "#ffffff",
    },
  },
  {
    id: "ice-blue",
    name: "Ice Blue",
    description: "Raindance 계열의 세련된 쿨 그린",
    colors: {
      headerBg: "#e7efee",
      headerText: "#2f3f3f",
      headerSiteNameText: "#2f3f3f",
      headerMenuText: "#2f3f3f",
      footerBg: "#dee7e5",
      footerText: "#2f3f3f",
      primary: "#5b8f8a",
      accent: "#d08a62",
      contentBg: "#f6fbfa",
      buttonText: "#ffffff",
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
