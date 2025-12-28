import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

// GET: List all posts
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    const posts = await prisma.post.findMany({
        where: type ? { type } : undefined,
        include: {
            author: { select: { name: true } },
            _count: { select: { comments: true } },
        },
        orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(posts);
}

// POST: Create a new post
export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
    }

    const body = await req.json();
    const { title, content, contentMarkdown, type, isSecret, isPinned, attachments } = body;

    if (!title || !content || !type) {
        return NextResponse.json({ error: "모든 필드를 입력해주세요" }, { status: 400 });
    }

    const post = await prisma.post.create({
        data: {
            title,
            content,
            contentMarkdown: typeof contentMarkdown === "string" && contentMarkdown.trim()
                ? contentMarkdown.trim()
                : null,
            type,
            isSecret: Boolean(isSecret),
            isPinned: session.user.role === "ADMIN" ? Boolean(isPinned) : false,
            authorId: session.user.id,
            attachments: Array.isArray(attachments) && attachments.length
                ? {
                    create: attachments
                        .filter((item) => typeof item?.url === "string" && item.url.trim())
                        .map((item) => ({
                            url: item.url.trim(),
                            name: typeof item.name === "string" ? item.name.trim() || null : null,
                            type: typeof item.type === "string" ? item.type.trim() || null : null,
                            size: typeof item.size === "number" ? item.size : null,
                        })),
                }
                : undefined,
        },
        include: {
            attachments: true,
        },
    });

    return NextResponse.json(post, { status: 201 });
}
