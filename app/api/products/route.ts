import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { sanitizeHtmlContent } from "@/lib/sanitize-html";

// GET: List products
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");

    const products = await prisma.product.findMany({
        where: category ? { category, isVisible: true } : { isVisible: true },
        orderBy: { createdAt: "desc" },
    });

    const sanitized = products.map((product) => ({
        ...product,
        content: sanitizeHtmlContent(product.content),
    }));

    return NextResponse.json(sanitized);
}

// POST: Create a new product (Admin only)
export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "관리자 권한이 필요합니다" }, { status: 403 });
    }

    const body = await req.json();
    const { title, content, category, price, imageUrl } = body;

    if (!title || !content || !category) {
        return NextResponse.json({ error: "필수 항목을 입력해주세요" }, { status: 400 });
    }

    const sanitizedContent = sanitizeHtmlContent(content);

    const product = await prisma.product.create({
        data: {
            title,
            content: sanitizedContent,
            category,
            price: price || null,
            imageUrl: imageUrl || null,
        },
    });

    return NextResponse.json(product, { status: 201 });
}
