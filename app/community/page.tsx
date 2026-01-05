import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getDefaultCommunityBoard } from "@/lib/community";

export default async function CommunityIndexPage() {
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN";

  const target = await getDefaultCommunityBoard({
    includeHiddenBoards: isAdmin,
    includeHiddenGroups: isAdmin,
  });
  if (!target) {
    return (
      <div className="container mx-auto px-4 py-10 max-w-5xl">
        <div className="rounded-2xl border border-black/5 bg-white/80 p-8 text-center text-gray-500">
          게시판이 아직 없습니다. 관리자에게 게시판 생성을 요청해주세요.
        </div>
      </div>
    );
  }

  const requiresAuth = target.group.requiresAuth ?? false;
  if (requiresAuth && !session) {
    const callbackUrl = `/community/${target.group.slug}/${target.board.slug}`;
    redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }

  redirect(`/community/${target.group.slug}/${target.board.slug}`);
}
