import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { getSiteSettings } from "@/lib/site-settings";

interface RouteParams {
    params: Promise<{ id: string }>;
}

// POST: Create a comment on a post
export async function POST(req: NextRequest, { params }: RouteParams) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
    }
    const settings = await getSiteSettings();
    if (!settings.communityEnabled && session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "커뮤니티 기능이 비활성화되어 있습니다." }, { status: 403 });
    }

    const { id: postId } = await params;
    const body = await req.json();
    const { content } = body;

    if (!content?.trim()) {
        return NextResponse.json({ error: "댓글 내용을 입력해주세요" }, { status: 400 });
    }

    // Check if post exists
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
        return NextResponse.json({ error: "게시글을 찾을 수 없습니다" }, { status: 404 });
    }
    const isAuthor = post.authorId === session.user.id;
    const isAdmin = session.user.role === "ADMIN";
    if (post.isSecret && !isAuthor && !isAdmin) {
        return NextResponse.json({ error: "비밀글입니다" }, { status: 403 });
    }

    const comment = await prisma.comment.create({
        data: {
            content,
            postId,
            authorId: session.user.id,
        },
        include: {
            author: { select: { name: true } },
        },
    });

    return NextResponse.json(comment, { status: 201 });
}
