import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { auth } from "@/auth";
import { getBoardMapByIds } from "@/lib/community";
import { BackButton } from "@/components/ui/back-button";
import { FileText, Package } from "lucide-react";

interface SearchPageProps {
    searchParams: Promise<{
        q?: string;
    }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
    const { q } = await searchParams;
    const query = (q || "").trim();
    const session = await auth();

    if (!query) {
        return (
            <div className="container mx-auto px-4 py-10 max-w-5xl">
                <h1 className="text-2xl font-bold mb-4">검색</h1>
                <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
                    검색어를 입력해주세요.
                </div>
            </div>
        );
    }

    const [posts, products] = await Promise.all([
        prisma.post.findMany({
            where: {
                OR: [
                    { title: { contains: query, mode: "insensitive" } },
                    { contentMarkdown: { contains: query, mode: "insensitive" } },
                ],
            },
            include: {
                author: { select: { name: true } },
                _count: { select: { comments: true } },
            },
            orderBy: { createdAt: "desc" },
            take: 20,
        }),
        prisma.product.findMany({
            where: {
                isVisible: true,
                ...(session ? {} : { NOT: { categoryRef: { is: { requiresAuth: true } } } }),
                OR: [
                    { title: { contains: query, mode: "insensitive" } },
                    { categoryRef: { is: { name: { contains: query, mode: "insensitive" } } } },
                    { categoryRef: { is: { slug: { contains: query, mode: "insensitive" } } } },
                ],
            },
            orderBy: { createdAt: "desc" },
            take: 20,
            include: { categoryRef: true },
        }),
    ]);

    const boardMap = await getBoardMapByIds(posts.map((post) => post.boardId));

    const totalResults = posts.length + products.length;

    return (
        <div className="container mx-auto px-4 py-6 max-w-3xl">
            {/* 헤더 */}
            <div className="mb-4">
                <BackButton label="돌아가기" className="mb-3" />
                <div className="flex items-baseline gap-2">
                    <h1 className="font-display text-xl md:text-2xl">
                        &quot;{query}&quot;
                    </h1>
                    <span className="text-sm text-gray-500">
                        검색 결과 {totalResults}건
                    </span>
                </div>
            </div>

            {totalResults === 0 ? (
                <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
                    검색 결과가 없습니다.
                </div>
            ) : (
                <div className="rounded-xl border border-black/5 bg-white overflow-hidden divide-y divide-gray-100">
                    {/* 상품 결과 */}
                    {products.map((product) => (
                        <Link
                            key={`product-${product.id}`}
                            href={`/products/${product.categoryRef?.slug ?? "unknown"}/${product.id}`}
                            className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors"
                        >
                            {/* 썸네일 */}
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                {product.imageUrl ? (
                                    <Image
                                        src={product.imageUrl}
                                        alt={product.title}
                                        width={48}
                                        height={48}
                                        className="w-full h-full object-cover"
                                        unoptimized
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Package className="w-5 h-5 text-gray-300" />
                                    </div>
                                )}
                            </div>
                            {/* 내용 */}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                    {product.title}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <span className="text-sky-600">{product.categoryRef?.name ?? "미분류"}</span>
                                    <span>·</span>
                                    <span>{format(product.createdAt, "MM.dd")}</span>
                                    {product.price && (
                                        <>
                                            <span>·</span>
                                            <span className="text-sky-700 font-medium">{product.price}</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </Link>
                    ))}

                    {/* 게시글 결과 */}
                    {posts.map((post) => {
                        const boardInfo = boardMap.get(post.boardId);
                        const href = boardInfo ? `${boardInfo.href}/${post.id}` : `/community/${post.id}`;
                        return (
                            <Link
                                key={`post-${post.id}`}
                                href={href}
                                className="flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors"
                            >
                                {/* 아이콘 */}
                                <div className="w-12 h-12 rounded-lg bg-gray-100 flex-shrink-0 flex items-center justify-center">
                                    <FileText className="w-5 h-5 text-gray-400" />
                                </div>
                                {/* 내용 */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                        {post.title}
                                        {post._count.comments > 0 && (
                                            <span className="ml-1 text-sky-500">[{post._count.comments}]</span>
                                        )}
                                    </p>
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <span className="text-emerald-600">{boardInfo?.boardSlug ?? "게시글"}</span>
                                        <span>·</span>
                                        <span>{post.author.name || "익명"}</span>
                                        <span>·</span>
                                        <span>{format(post.createdAt, "MM.dd")}</span>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
