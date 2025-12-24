import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

// GET: List products
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const session = await auth();
    const isAdmin = session?.user?.role === "ADMIN";

    if (category === "VIP_TRIP" && !session) {
        return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
    }

    const products = await prisma.product.findMany({
        where: category
            ? {
                category,
                isVisible: isAdmin ? undefined : true,
            }
            : {
                isVisible: isAdmin ? undefined : true,
                ...(session ? {} : { category: { not: "VIP_TRIP" } }),
            },
        orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(products);
}

// POST: Create a new product (Admin only)
export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "관리자 권한이 필요합니다" }, { status: 403 });
    }

    const body = await req.json();
    const { title, content, contentMarkdown, category, price, imageUrl } = body;

    if (!title || !content || !category) {
        return NextResponse.json({ error: "필수 항목을 입력해주세요" }, { status: 400 });
    }

    const product = await prisma.product.create({
        data: {
            title,
            content,
            contentMarkdown: typeof contentMarkdown === "string" && contentMarkdown.trim()
                ? contentMarkdown.trim()
                : null,
            category,
            price: price || null,
            imageUrl: imageUrl || null,
        },
    });

    return NextResponse.json(product, { status: 201 });
}
