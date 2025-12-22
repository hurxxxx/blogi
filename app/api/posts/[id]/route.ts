import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { sanitizeHtmlContent } from "@/lib/sanitize-html";

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET: Get a single post
export async function GET(req: NextRequest, { params }: RouteParams) {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const shouldIncrement =
        searchParams.get("view") === "1" || searchParams.get("view") === "true";

    const post = await prisma.post.findUnique({
        where: { id },
        include: {
            author: { select: { id: true, name: true } },
            comments: {
                include: {
                    author: { select: { id: true, name: true } },
                },
                orderBy: { createdAt: "asc" },
            },
        },
    });

    if (!post) {
        return NextResponse.json({ error: "게시글을 찾을 수 없습니다" }, { status: 404 });
    }

    if (shouldIncrement) {
        // Increment view count
        await prisma.post.update({
            where: { id },
            data: { viewCount: { increment: 1 } },
        });
    }

    return NextResponse.json({
        ...post,
        viewCount: shouldIncrement ? post.viewCount + 1 : post.viewCount,
        content: sanitizeHtmlContent(post.content),
        authorId: post.author.id,
        comments: post.comments.map((c) => ({
            ...c,
            authorId: c.author.id,
        })),
    });
}

// PUT: Update a post
export async function PUT(req: NextRequest, { params }: RouteParams) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
    }

    const { id } = await params;
    const post = await prisma.post.findUnique({ where: { id } });

    if (!post) {
        return NextResponse.json({ error: "게시글을 찾을 수 없습니다" }, { status: 404 });
    }

    // Check permission: author or admin
    const isAuthor = post.authorId === session.user.id;
    const isAdmin = session.user.role === "ADMIN";
    if (!isAuthor && !isAdmin) {
        return NextResponse.json({ error: "수정 권한이 없습니다" }, { status: 403 });
    }

    const body = await req.json();
    const { title, content, type } = body;

    const sanitizedContent = sanitizeHtmlContent(content);
    const updated = await prisma.post.update({
        where: { id },
        data: { title, content: sanitizedContent, type },
    });

    return NextResponse.json(updated);
}

// DELETE: Delete a post
export async function DELETE(req: NextRequest, { params }: RouteParams) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
    }

    const { id } = await params;
    const post = await prisma.post.findUnique({ where: { id } });

    if (!post) {
        return NextResponse.json({ error: "게시글을 찾을 수 없습니다" }, { status: 404 });
    }

    // Check permission: author or admin
    const isAuthor = post.authorId === session.user.id;
    const isAdmin = session.user.role === "ADMIN";
    if (!isAuthor && !isAdmin) {
        return NextResponse.json({ error: "삭제 권한이 없습니다" }, { status: 403 });
    }

    await prisma.post.delete({ where: { id } });

    return NextResponse.json({ success: true });
}
