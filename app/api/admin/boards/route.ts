import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { normalizeBoardKey } from "@/lib/boards";
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
  const { action } = body;

  if (action === "create") {
    const { data } = body;
    if (!data?.name) {
      return NextResponse.json({ error: "게시판 이름이 필요합니다" }, { status: 400 });
    }
    const key = normalizeBoardKey(data.key ?? "", data.name);
    if (!key) {
      return NextResponse.json({ error: "게시판 키가 필요합니다" }, { status: 400 });
    }
    const exists = await prisma.board.findUnique({ where: { key } });
    if (exists) {
      return NextResponse.json({ error: "이미 존재하는 게시판 키입니다" }, { status: 400 });
    }
    const count = await prisma.board.count();
    const board = await prisma.board.create({
      data: {
        key,
        name: data.name,
        description: data.description || null,
        isVisible: data.isVisible ?? true,
        order: data.order ?? count + 1,
      },
    });
    revalidatePath("/", "layout");
    revalidatePath("/community");
    return NextResponse.json(board, { status: 201 });
  }

  if (action === "update") {
    const { id, data } = body;
    if (!id) {
      return NextResponse.json({ error: "ID가 필요합니다" }, { status: 400 });
    }
    const existing = await prisma.board.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "게시판을 찾을 수 없습니다" }, { status: 404 });
    }
    const nextKey = normalizeBoardKey(data?.key ?? existing.key, data?.name ?? existing.name);
    if (!nextKey) {
      return NextResponse.json({ error: "게시판 키가 필요합니다" }, { status: 400 });
    }
    if (nextKey !== existing.key) {
      const duplicate = await prisma.board.findUnique({ where: { key: nextKey } });
      if (duplicate) {
        return NextResponse.json({ error: "이미 존재하는 게시판 키입니다" }, { status: 400 });
      }
      await prisma.post.updateMany({
        where: { type: { equals: existing.key, mode: "insensitive" } },
        data: { type: nextKey },
      });
    }
    const board = await prisma.board.update({
      where: { id },
      data: {
        key: nextKey,
        name: data?.name ?? existing.name,
        description: typeof data?.description === "string" ? data.description : existing.description,
        isVisible: typeof data?.isVisible === "boolean" ? data.isVisible : existing.isVisible,
      },
    });
    revalidatePath("/", "layout");
    revalidatePath("/community");
    return NextResponse.json(board);
  }

  if (action === "delete") {
    const { id } = body;
    if (!id) {
      return NextResponse.json({ error: "ID가 필요합니다" }, { status: 400 });
    }
    const existing = await prisma.board.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "게시판을 찾을 수 없습니다" }, { status: 404 });
    }
    const postCount = await prisma.post.count({
      where: { type: { equals: existing.key, mode: "insensitive" } },
    });
    if (postCount > 0) {
      return NextResponse.json(
        { error: "게시글이 있는 게시판은 삭제할 수 없습니다. 먼저 게시글을 정리해주세요." },
        { status: 400 }
      );
    }
    await prisma.board.delete({ where: { id } });
    revalidatePath("/", "layout");
    revalidatePath("/community");
    return NextResponse.json({ success: true });
  }

  if (action === "reorder") {
    const { items } = body;
    if (!Array.isArray(items)) {
      return NextResponse.json({ error: "정렬 정보가 필요합니다" }, { status: 400 });
    }
    await prisma.$transaction(
      items.map((item: { id: string; order: number }) =>
        prisma.board.update({
          where: { id: item.id },
          data: { order: item.order },
        })
      )
    );
    revalidatePath("/", "layout");
    revalidatePath("/community");
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "지원하지 않는 동작입니다" }, { status: 400 });
}
