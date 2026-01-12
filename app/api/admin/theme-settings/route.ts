import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { themePresets } from "@/lib/theme-presets";

const requireAdmin = async () => {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return null;
  }
  return session;
};

// 테마 설정 조회
export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "관리자 권한이 필요합니다" }, { status: 403 });
  }

  const settings = await prisma.siteSettings.findUnique({
    where: { key: "default" },
    select: {
      themePreset: true,
      customHeaderBg: true,
      customHeaderText: true,
      customFooterBg: true,
      customFooterText: true,
      customPrimary: true,
      customAccent: true,
      customContentBg: true,
    },
  });

  return NextResponse.json({
    settings: settings ?? {
      themePreset: "classic-navy",
      customHeaderBg: null,
      customHeaderText: null,
      customFooterBg: null,
      customFooterText: null,
      customPrimary: null,
      customAccent: null,
      customContentBg: null,
    },
    presets: themePresets,
  });
}

// 테마 설정 저장
export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "관리자 권한이 필요합니다" }, { status: 403 });
  }

  const body = await req.json();
  const {
    themePreset,
    customHeaderBg,
    customHeaderText,
    customFooterBg,
    customFooterText,
    customPrimary,
    customAccent,
    customContentBg,
  } = body;

  // 유효한 프리셋인지 확인
  const validPresetIds = themePresets.map((p) => p.id);
  if (themePreset && !validPresetIds.includes(themePreset)) {
    return NextResponse.json({ error: "유효하지 않은 테마 프리셋입니다" }, { status: 400 });
  }

  // HEX 색상 검증
  const hexRegex = /^#[0-9A-Fa-f]{6}$/;
  const validateColor = (color: unknown): string | null => {
    if (typeof color === "string" && hexRegex.test(color)) {
      return color;
    }
    return null;
  };

  const data: Record<string, unknown> = {};

  if (themePreset) {
    data.themePreset = themePreset;
  }

  // 커스텀 색상 (빈 문자열이면 null로 저장하여 프리셋 색상 사용)
  data.customHeaderBg = validateColor(customHeaderBg);
  data.customHeaderText = validateColor(customHeaderText);
  data.customFooterBg = validateColor(customFooterBg);
  data.customFooterText = validateColor(customFooterText);
  data.customPrimary = validateColor(customPrimary);
  data.customAccent = validateColor(customAccent);
  data.customContentBg = validateColor(customContentBg);

  const settings = await prisma.siteSettings.upsert({
    where: { key: "default" },
    update: data,
    create: {
      key: "default",
      ...data,
    },
  });

  // 전체 레이아웃 revalidate
  revalidatePath("/", "layout");

  return NextResponse.json(settings);
}
