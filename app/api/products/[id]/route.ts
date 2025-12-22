import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET: Product detail
export async function GET(req: NextRequest, { params }: RouteParams) {
    const { id } = await params;
    const product = await prisma.product.findUnique({
        where: { id },
    });

    if (!product) {
        return NextResponse.json({ error: "상품을 찾을 수 없습니다" }, { status: 404 });
    }

    return NextResponse.json({
        ...product,
        content: product.content,
    });
}

// PUT: Update product (Admin only)
export async function PUT(req: NextRequest, { params }: RouteParams) {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "관리자 권한이 필요합니다" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { title, content, contentMarkdown, category, price, imageUrl, isVisible } = body;

    if (!title || !content || !category) {
        return NextResponse.json({ error: "필수 항목을 입력해주세요" }, { status: 400 });
    }

    const updateData: {
        title: string;
        content: string;
        contentMarkdown?: string | null;
        category: string;
        price?: string | null;
        imageUrl?: string | null;
        isVisible: boolean;
    } = {
        title,
        content,
        category,
        price: price || null,
        imageUrl: imageUrl || null,
        isVisible: typeof isVisible === "boolean" ? isVisible : true,
    };
    if (typeof contentMarkdown === "string") {
        updateData.contentMarkdown = contentMarkdown.trim() || null;
    }

    const updated = await prisma.product.update({
        where: { id },
        data: updateData,
    });

    return NextResponse.json(updated);
}

// DELETE: Delete product (Admin only)
export async function DELETE(req: NextRequest, { params }: RouteParams) {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "관리자 권한이 필요합니다" }, { status: 403 });
    }

    const { id } = await params;
    await prisma.product.delete({ where: { id } });

    return NextResponse.json({ success: true });
}
