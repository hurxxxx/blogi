import { prefersLightText } from "@/lib/theme-presets";

export const DEFAULT_LOGO_URL = "/logo.svg";
export const DEFAULT_LOGO_INVERSE_URL = "/logo_white.svg";
export const DEFAULT_BANNER_URL = "/logo.svg";
export const DEFAULT_BANNER_INVERSE_URL = "/logo_white.svg";

export const getDefaultLogoForBackground = (backgroundColor: string) =>
  prefersLightText(backgroundColor) ? DEFAULT_LOGO_INVERSE_URL : DEFAULT_LOGO_URL;

export const getDefaultBannerForBackground = (backgroundColor: string) =>
  prefersLightText(backgroundColor) ? DEFAULT_BANNER_INVERSE_URL : DEFAULT_BANNER_URL;

export const getLogoForBackground = (
  backgroundColor: string,
  options: {
    light?: string | null;
    dark?: string | null;
    fallback?: string | null;
  } = {}
) => {
  const prefersLight = prefersLightText(backgroundColor);
  if (prefersLight) {
    return (
      options.dark?.trim() ||
      options.light?.trim() ||
      options.fallback?.trim() ||
      getDefaultLogoForBackground(backgroundColor)
    );
  }
  return (
    options.light?.trim() ||
    options.dark?.trim() ||
    options.fallback?.trim() ||
    getDefaultLogoForBackground(backgroundColor)
  );
};
