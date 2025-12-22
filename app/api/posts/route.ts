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
    const { title, content, type } = body;

    if (!title || !content || !type) {
        return NextResponse.json({ error: "모든 필드를 입력해주세요" }, { status: 400 });
    }

    const post = await prisma.post.create({
        data: {
            title,
            content,
            type,
            authorId: session.user.id,
        },
    });

    return NextResponse.json(post, { status: 201 });
}
