/**
 * 헤더 스타일 타입 및 상수 정의
 * 2025-2026 웹 디자인 트렌드 반영
 */

export type HeaderStyle = "classic" | "glassmorphism" | "minimal" | "bento";

export interface HeaderStyleConfig {
  label: string;
  description: string;
  preview: {
    bg: string;
    text: string;
  };
}

export const HEADER_STYLES: Record<HeaderStyle, HeaderStyleConfig> = {
  classic: {
    label: "클래식",
    description: "기존 다크 테마 스타일",
    preview: {
      bg: "bg-[#0b1320]",
      text: "text-white",
    },
  },
  glassmorphism: {
    label: "글래스모피즘",
    description: "Apple 스타일 반투명 유리 효과",
    preview: {
      bg: "bg-white/70 backdrop-blur-xl",
      text: "text-gray-900",
    },
  },
  minimal: {
    label: "미니멀",
    description: "깔끔한 여백과 큰 타이포그래피",
    preview: {
      bg: "bg-white",
      text: "text-gray-900",
    },
  },
  bento: {
    label: "Bento 그리드",
    description: "모듈형 레이아웃과 마이크로 애니메이션",
    preview: {
      bg: "bg-gray-50",
      text: "text-gray-900",
    },
  },
};

export const HEADER_STYLE_OPTIONS = Object.entries(HEADER_STYLES).map(
  ([value, config]) => ({
    value: value as HeaderStyle,
    label: config.label,
    description: config.description,
  })
);

export function isValidHeaderStyle(style: string): style is HeaderStyle {
  return ["classic", "glassmorphism", "minimal", "bento"].includes(style);
}
