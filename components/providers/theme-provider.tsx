import type { ThemeColors } from "@/lib/theme-presets";

interface ThemeProviderProps {
  themeColors: ThemeColors;
  children: React.ReactNode;
}

export function ThemeProvider({ themeColors, children }: ThemeProviderProps) {
  const cssVars = {
    "--theme-header-bg": themeColors.headerBg,
    "--theme-header-text": themeColors.headerText,
    "--theme-header-site-name-text": themeColors.headerSiteNameText,
    "--theme-header-menu-text": themeColors.headerMenuText,
    "--theme-footer-bg": themeColors.footerBg,
    "--theme-footer-text": themeColors.footerText,
    "--theme-primary": themeColors.primary,
    "--theme-accent": themeColors.accent,
    "--theme-content-bg": themeColors.contentBg,
    "--theme-button-text": themeColors.buttonText,
    "--primary": themeColors.primary,
    "--accent": themeColors.accent,
  } as React.CSSProperties & Record<string, string>;

  if (themeColors.buttonText?.trim()) {
    cssVars["--primary-foreground"] = themeColors.buttonText;
    cssVars["--accent-foreground"] = themeColors.buttonText;
  }

  return (
    <div style={cssVars} className="contents">
      {children}
    </div>
  );
}
