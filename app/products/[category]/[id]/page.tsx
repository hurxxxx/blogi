import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { notFound, redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RichTextViewer } from "@/components/editor/rich-text-viewer";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/auth";

interface ProductDetailPageProps {
    params: Promise<{
        id: string;
        category: string;
    }>;
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
    const { id, category } = await params;
    const session = await auth();
    if (category === "vip-trip" && !session) {
        redirect(`/login?callbackUrl=${encodeURIComponent(`/products/${category}/${id}`)}`);
    }

    const product = await prisma.product.findUnique({
        where: {
            id,
        },
    });

    if (!product) {
        notFound();
    }

    if (product.category === "VIP_TRIP" && !session) {
        redirect(`/login?callbackUrl=${encodeURIComponent(`/products/${category}/${id}`)}`);
    }

    return (
        <div className="container mx-auto px-4 py-10 max-w-5xl">
            <Button variant="ghost" className="mb-6 -ml-2" asChild>
                <Link href={`/products/${category}`}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    목록으로
                </Link>
            </Button>

            {/* Breadcrumb / Category */}
            <div className="mb-4">
                <Badge variant="outline" className="text-sm uppercase">
                    {product.category.replace("_", " ")}
                </Badge>
            </div>

            {/* Title */}
            <h1 className="font-display text-3xl md:text-5xl mb-6">
                {product.title}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center text-gray-500 text-sm mb-8 border-b pb-4 gap-2">
                <span>{format(product.createdAt, "yyyy.MM.dd")}</span>
                {product.price && (
                    <span className="ml-auto font-bold text-lg text-sky-600">
                        {product.price}
                    </span>
                )}
            </div>

            {/* Content (Rich Text) */}
            <RichTextViewer content={product.content} />
        </div>
    );
}
