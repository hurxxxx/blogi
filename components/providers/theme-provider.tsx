import type { ThemeColors } from "@/lib/theme-presets";

interface ThemeProviderProps {
  themeColors: ThemeColors;
  children: React.ReactNode;
}

export function ThemeProvider({ themeColors, children }: ThemeProviderProps) {
  const cssVars = {
    "--theme-header-bg": themeColors.headerBg,
    "--theme-header-text": themeColors.headerText,
    "--theme-footer-bg": themeColors.footerBg,
    "--theme-footer-text": themeColors.footerText,
    "--theme-primary": themeColors.primary,
    "--theme-accent": themeColors.accent,
    "--theme-content-bg": themeColors.contentBg,
  } as React.CSSProperties;

  return (
    <div style={cssVars} className="contents">
      {children}
    </div>
  );
}
