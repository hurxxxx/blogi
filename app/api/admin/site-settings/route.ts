import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const requireAdmin = async () => {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return null;
  }
  return session;
};

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "관리자 권한이 필요합니다" }, { status: 403 });
  }

  const body = await req.json();
  const { siteName, siteLogoUrl } = body;

  const data = {
    siteName: typeof siteName === "string" && siteName.trim() ? siteName.trim() : null,
    siteLogoUrl: typeof siteLogoUrl === "string" && siteLogoUrl.trim() ? siteLogoUrl.trim() : null,
  };

  const settings = await prisma.siteSettings.upsert({
    where: { key: "default" },
    update: data,
    create: {
      key: "default",
      ...data,
    },
  });

  return NextResponse.json(settings);
}
