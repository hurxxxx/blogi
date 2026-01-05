import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";
import { PostListView } from "@/app/community/post-list-view";
import { getCommunityGroupBySlug } from "@/lib/community";
import { PenLine, Search } from "lucide-react";

async function PostList({
  boardId,
  groupSlug,
  boardSlug,
  sessionUserId,
  sessionRole,
  query,
  page,
  pageSize,
}: {
  boardId: string;
  groupSlug: string;
  boardSlug: string;
  sessionUserId?: string | null;
  sessionRole?: string | null;
  query: string;
  page: number;
  pageSize: number;
}) {
  const where: Record<string, unknown> = {
    boardId,
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
      author: { select: { name: true } },
      _count: { select: { comments: true } },
    },
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
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
    params.set("page", String(targetPage));
    return `/community/${groupSlug}/${boardSlug}?${params.toString()}`;
  };

  return (
    <div className="space-y-6">
      <PostListView
        posts={viewPosts}
        sessionUserId={sessionUserId}
        sessionRole={sessionRole}
        postBasePath={`/community/${groupSlug}/${boardSlug}`}
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

interface CommunityBoardPageProps {
  params: Promise<{ group: string; board: string }>;
  searchParams: Promise<{
    q?: string;
    page?: string;
  }>;
}

export default async function CommunityBoardPage({ params, searchParams }: CommunityBoardPageProps) {
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN";
  const { group, board } = await params;
  const queryParams = await searchParams;
  const query = (queryParams.q || "").trim();
  const page = Math.max(1, Number(queryParams.page || 1));
  const pageSize = 10;

  const community = await getCommunityGroupBySlug(group, {
    includeHiddenBoards: isAdmin,
    includeHiddenGroups: isAdmin,
  });
  if (!community) {
    notFound();
  }

  const currentBoard = community.boards.find((item) => item.slug === board);
  if (!currentBoard) {
    redirect(`/community/${community.slug}`);
  }

  const requiresAuth = community.requiresAuth ?? false;
  if (requiresAuth && !session) {
    const callbackUrl = `/community/${community.slug}/${currentBoard.slug}`;
    redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }

  return (
    <div className="container mx-auto px-4 py-6 md:py-10 max-w-5xl">
      {/* 헤더: 제목 */}
      <div className="mb-4">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Community</p>
        <h1 className="font-display text-2xl sm:text-3xl md:text-4xl">{community.label}</h1>
      </div>

      {/* 1. 게시판 선택 탭 (게시판이 2개 이상일 때만) */}
      {community.boards.length > 1 && (
        <div className="mb-4">
          <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
            {community.boards.map((boardItem) => {
              const href = `/community/${community.slug}/${boardItem.slug}`;
              const isActive = boardItem.slug === currentBoard.slug;
              return (
                <Link
                  key={boardItem.id}
                  href={href}
                  className={`flex-shrink-0 px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${
                    isActive
                      ? "bg-[#0b1320] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {boardItem.name}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. 액션바: 글쓰기 + 검색 */}
      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        {/* 글쓰기 버튼 */}
        <Button asChild className="sm:order-2">
          <Link href={`/community/${community.slug}/${currentBoard.slug}/write`}>
            <PenLine className="w-4 h-4 mr-1.5" />
            글쓰기
          </Link>
        </Button>

        {/* 검색 폼 */}
        <form
          className="flex-1 flex gap-2 sm:order-1"
          action={`/community/${community.slug}/${currentBoard.slug}`}
          method="get"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              name="q"
              placeholder="검색..."
              defaultValue={query}
              className="pl-9 bg-white"
            />
          </div>
          <Button type="submit" variant="outline">
            검색
          </Button>
        </form>
      </div>

      <PostList
        boardId={currentBoard.id}
        groupSlug={community.slug}
        boardSlug={currentBoard.slug}
        sessionUserId={session?.user?.id}
        sessionRole={session?.user?.role}
        query={query}
        page={page}
        pageSize={pageSize}
      />
    </div>
  );
}
