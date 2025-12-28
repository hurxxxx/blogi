import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

interface RouteParams {
    params: Promise<{ id: string }>;
}

// DELETE: Delete a comment
export async function DELETE(req: NextRequest, { params }: RouteParams) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
    }

    const { id } = await params;
    const comment = await prisma.comment.findUnique({ where: { id } });

    if (!comment) {
        return NextResponse.json({ error: "댓글을 찾을 수 없습니다" }, { status: 404 });
    }

    // Check permission: author or admin
    const isAuthor = comment.authorId === session.user.id;
    const isAdmin = session.user.role === "ADMIN";
    if (!isAuthor && !isAdmin) {
        return NextResponse.json({ error: "삭제 권한이 없습니다" }, { status: 403 });
    }

    await prisma.comment.delete({ where: { id } });

    return NextResponse.json({ success: true });
}

// PATCH: Update a comment
export async function PATCH(req: NextRequest, { params }: RouteParams) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json().catch(() => null);
    const content = typeof body?.content === "string" ? body.content.trim() : "";

    if (!content) {
        return NextResponse.json({ error: "내용을 입력해주세요" }, { status: 400 });
    }

    const comment = await prisma.comment.findUnique({ where: { id } });

    if (!comment) {
        return NextResponse.json({ error: "댓글을 찾을 수 없습니다" }, { status: 404 });
    }

    // Check permission: author or admin
    const isAuthor = comment.authorId === session.user.id;
    const isAdmin = session.user.role === "ADMIN";
    if (!isAuthor && !isAdmin) {
        return NextResponse.json({ error: "수정 권한이 없습니다" }, { status: 403 });
    }

    const updated = await prisma.comment.update({
        where: { id },
        data: { content },
    });

    return NextResponse.json(updated);
}
