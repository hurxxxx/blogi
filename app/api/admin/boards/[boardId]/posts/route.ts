import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const requireAdmin = async () => {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return null;
  }
  return session;
};

// GET: 게시글 수 조회
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ boardId: string }> }
) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });
  }

  const { boardId } = await params;
  const board = await prisma.board.findUnique({ where: { id: boardId } });
  if (!board) {
    return NextResponse.json({ error: "게시판 없음" }, { status: 404 });
  }

  const count = await prisma.post.count({ where: { boardId: board.id } });
  return NextResponse.json({ count, boardId: board.id, boardName: board.name });
}

// DELETE: 게시글 일괄 삭제
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ boardId: string }> }
) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });
  }

  const { boardId } = await params;
  const board = await prisma.board.findUnique({ where: { id: boardId } });
  if (!board) {
    return NextResponse.json({ error: "게시판 없음" }, { status: 404 });
  }

  // 관련 게시글 조회
  const posts = await prisma.post.findMany({
    where: { boardId: board.id },
    select: { id: true },
  });
  const postIds = posts.map((p) => p.id);

  if (postIds.length === 0) {
    return NextResponse.json({ success: true, deleted: 0 });
  }

  // 관련 댓글 먼저 삭제 후 게시글 삭제
  await prisma.$transaction([
    prisma.comment.deleteMany({ where: { postId: { in: postIds } } }),
    prisma.post.deleteMany({ where: { boardId: board.id } }),
  ]);

  revalidatePath("/community");
  revalidatePath("/admin/menus");
  return NextResponse.json({ success: true, deleted: postIds.length });
}
