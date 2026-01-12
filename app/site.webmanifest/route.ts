import { NextResponse } from "next/server";
import { getSiteSettings } from "@/lib/site-settings";

export async function GET() {
  const settings = await getSiteSettings();
  const name = settings.siteName || "Blogi";
  const icons = [
    settings.faviconAndroid192
      ? {
          src: settings.faviconAndroid192,
          sizes: "192x192",
          type: "image/png",
        }
      : null,
    settings.faviconAndroid512
      ? {
          src: settings.faviconAndroid512,
          sizes: "512x512",
          type: "image/png",
        }
      : null,
  ].filter(Boolean);

  return NextResponse.json(
    {
      name,
      short_name: name,
      start_url: "/",
      display: "standalone",
      background_color: settings.themeColors.contentBg,
      theme_color: settings.themeColors.primary,
      icons,
    },
    {
      headers: {
        "Content-Type": "application/manifest+json",
      },
    }
  );
}
