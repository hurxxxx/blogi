import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

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
  const { showHomeDashboardOnMobile } = body;

  if (typeof showHomeDashboardOnMobile !== "boolean") {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const updated = await prisma.siteSettings.upsert({
    where: { key: "default" },
    update: { showHomeDashboardOnMobile },
    create: {
      key: "default",
      showHomeDashboardOnMobile,
    },
  });

  revalidatePath("/", "layout");

  return NextResponse.json({ showHomeDashboardOnMobile: updated.showHomeDashboardOnMobile });
}
