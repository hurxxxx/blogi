import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const includeHidden = searchParams.get("all") === "true";
  const hiddenOnly = searchParams.get("hidden") === "true";
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN";

  if ((includeHidden || hiddenOnly) && !isAdmin) {
    return NextResponse.json({ error: "관리자 권한이 필요합니다" }, { status: 403 });
  }

  let whereClause: { isVisible?: boolean } = { isVisible: true };
  if (includeHidden) {
    whereClause = {};
  } else if (hiddenOnly) {
    whereClause = { isVisible: false };
  }

  const categories = await prisma.category.findMany({
    where: whereClause,
    include: {
      _count: {
        select: { contents: true }
      }
    },
    orderBy: { order: "asc" },
  });
  return NextResponse.json(categories);
}
