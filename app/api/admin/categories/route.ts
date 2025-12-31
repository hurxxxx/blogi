import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
    }

    const categories = await prisma.category.findMany({
      orderBy: { order: "asc" },
    });

    return NextResponse.json(categories);
  } catch {
    return NextResponse.json({ error: "카테고리 목록을 불러오는 중 오류가 발생했습니다." }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
    }

    const body = await request.json();
    const { id, thumbnailUrl, description } = body;

    if (!id) {
      return NextResponse.json({ error: "카테고리 ID가 필요합니다." }, { status: 400 });
    }

    const updated = await prisma.category.update({
      where: { id },
      data: {
        ...(thumbnailUrl !== undefined && { thumbnailUrl }),
        ...(description !== undefined && { description }),
      },
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "카테고리 수정 중 오류가 발생했습니다." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
    }

    const body = await request.json();
    const { action, id, data } = body;

    if (action === "update") {
      if (!id) {
        return NextResponse.json({ error: "카테고리 ID가 필요합니다." }, { status: 400 });
      }

      const updated = await prisma.category.update({
        where: { id },
        data: {
          ...(data?.thumbnailUrl !== undefined && { thumbnailUrl: data.thumbnailUrl }),
          ...(data?.description !== undefined && { description: data.description }),
        },
      });

      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: "지원하지 않는 동작입니다." }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "카테고리 수정 중 오류가 발생했습니다." }, { status: 500 });
  }
}
