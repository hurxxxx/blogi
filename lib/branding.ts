import { prefersLightText } from "@/lib/theme-presets";

export const DEFAULT_LOGO_URL = "/default-logo.svg";
export const DEFAULT_LOGO_INVERSE_URL = "/default-logo-inverse.svg";
export const DEFAULT_BANNER_URL = "/default-banner.svg";
export const DEFAULT_BANNER_INVERSE_URL = "/default-banner-inverse.svg";

export const getDefaultLogoForBackground = (backgroundColor: string) =>
  prefersLightText(backgroundColor) ? DEFAULT_LOGO_INVERSE_URL : DEFAULT_LOGO_URL;

export const getDefaultBannerForBackground = (backgroundColor: string) =>
  prefersLightText(backgroundColor) ? DEFAULT_BANNER_INVERSE_URL : DEFAULT_BANNER_URL;
