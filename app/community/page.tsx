import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { auth } from "@/auth";
import { PostListView } from "./post-list-view";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getBoards } from "@/lib/boards";
import { getSiteSettings } from "@/lib/site-settings";

async function PostList({
    boardKey,
    sessionUserId,
    sessionRole,
    query,
    page,
    pageSize,
}: {
    boardKey: string;
    sessionUserId?: string | null;
    sessionRole?: string | null;
    query: string;
    page: number;
    pageSize: number;
}) {
    const where: Record<string, unknown> = {
        type: { equals: boardKey, mode: "insensitive" },
    };

    if (query) {
        where.OR = [
            { title: { contains: query, mode: "insensitive" } },
            { contentMarkdown: { contains: query, mode: "insensitive" } },
        ];
    }

    const total = await prisma.post.count({ where });
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const currentPage = Math.min(Math.max(page, 1), totalPages);

    const posts = await prisma.post.findMany({
        where,
        include: {
            author: {
                select: { name: true },
            },
            _count: {
                select: { comments: true },
            },
        },
        orderBy: [
            { isPinned: "desc" },
            { createdAt: "desc" },
        ],
        skip: (currentPage - 1) * pageSize,
        take: pageSize,
    });

    const viewPosts = posts.map((post) => ({
        id: post.id,
        title: post.title,
        authorName: post.author?.name || "Anonymous",
        authorId: post.authorId,
        createdAt: post.createdAt.toISOString(),
        commentCount: post._count.comments,
        viewCount: post.viewCount,
        isPinned: post.isPinned,
        isSecret: post.isSecret,
    }));

    const buildPageHref = (targetPage: number) => {
        const params = new URLSearchParams();
        if (query) params.set("q", query);
        params.set("board", boardKey);
        params.set("page", String(targetPage));
        return `/community?${params.toString()}`;
    };

    return (
        <div className="space-y-6">
            <PostListView
                posts={viewPosts}
                sessionUserId={sessionUserId}
                sessionRole={sessionRole}
            />
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                    <Link
                        href={buildPageHref(Math.max(1, currentPage - 1))}
                        className={`px-3 py-1 rounded border text-sm ${
                            currentPage === 1 ? "pointer-events-none text-gray-300 border-gray-200" : "hover:bg-gray-50"
                        }`}
                    >
                        이전
                    </Link>
                    <span className="text-sm text-gray-500">
                        {currentPage} / {totalPages}
                    </span>
                    <Link
                        href={buildPageHref(Math.min(totalPages, currentPage + 1))}
                        className={`px-3 py-1 rounded border text-sm ${
                            currentPage === totalPages
                                ? "pointer-events-none text-gray-300 border-gray-200"
                                : "hover:bg-gray-50"
                        }`}
                    >
                        다음
                    </Link>
                </div>
            )}
        </div>
    );
}

interface CommunityPageProps {
    searchParams: Promise<{
        q?: string;
        page?: string;
        board?: string;
    }>;
}

export default async function CommunityPage({ searchParams }: CommunityPageProps) {
    const session = await auth();
    const settings = await getSiteSettings();
    const isAdmin = session?.user?.role === "ADMIN";
    const params = await searchParams;
    const query = (params.q || "").trim();
    const page = Math.max(1, Number(params.page || 1));
    const pageSize = 10;
    const boards = await getBoards({ includeHidden: Boolean(isAdmin) });
    const currentBoardKey = params.board || boards[0]?.key;
    const currentBoard = boards.find((board) => board.key === currentBoardKey) ?? boards[0];

    if (!settings.communityEnabled && !isAdmin) {
        return (
            <div className="container mx-auto px-4 py-10 max-w-5xl">
                <div className="rounded-2xl border border-black/5 bg-white/80 p-8 text-center shadow-[0_18px_50px_-32px_rgba(15,23,42,0.35)]">
                    <h1 className="font-display text-2xl mb-3">커뮤니티가 비활성화되어 있습니다</h1>
                    <p className="text-sm text-gray-500">
                        현재 커뮤니티 기능이 꺼져 있습니다. 관리자에게 문의해주세요.
                    </p>
                </div>
            </div>
        );
    }
    return (
        <div className="container mx-auto px-4 py-10 max-w-5xl">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
                <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Community</p>
                    <h1 className="font-display text-3xl sm:text-4xl">커뮤니티</h1>
                </div>
                <Button asChild>
                    <Link href={`/community/write${currentBoard?.key ? `?board=${currentBoard.key}` : ""}`}>글쓰기</Link>
                </Button>
            </div>

            <form
                className="mb-6 rounded-2xl border border-black/5 bg-white/80 p-4 shadow-[0_18px_50px_-32px_rgba(15,23,42,0.35)]"
                action="/community"
                method="get"
            >
                {currentBoard?.key && <input type="hidden" name="board" value={currentBoard.key} />}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                        <Label htmlFor="q">검색어</Label>
                        <Input id="q" name="q" placeholder="제목/내용 검색" defaultValue={query} />
                    </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2 justify-end">
                    <Button type="submit">검색</Button>
                    <Button type="reset" variant="outline" asChild>
                        <Link href="/community">초기화</Link>
                    </Button>
                </div>
            </form>

            <div className="mb-8">
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {boards.map((board) => {
                        const search = new URLSearchParams();
                        if (query) search.set("q", query);
                        search.set("board", board.key);
                        search.set("page", "1");
                        const href = `/community?${search.toString()}`;
                        const isActive = board.key === currentBoard?.key;
                        return (
                            <Link
                                key={board.id}
                                href={href}
                                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition ${
                                    isActive
                                        ? "bg-[#0b1320] text-white"
                                        : "bg-white text-gray-600 border border-black/5 hover:bg-gray-50"
                                }`}
                            >
                                {board.name}
                            </Link>
                        );
                    })}
                </div>
            </div>

            {currentBoard ? (
                <PostList
                    boardKey={currentBoard.key}
                    sessionUserId={session?.user?.id}
                    sessionRole={session?.user?.role}
                    query={query}
                    page={page}
                    pageSize={pageSize}
                />
            ) : (
                <div className="rounded-2xl border border-black/5 bg-white/80 p-8 text-center text-gray-500">
                    게시판이 아직 없습니다. 관리자에게 게시판 생성을 요청해주세요.
                </div>
            )}
        </div>
    );
}
