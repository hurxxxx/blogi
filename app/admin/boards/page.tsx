import { BoardManager } from "@/components/admin/board-manager";
import { getBoards } from "@/lib/boards";
import { getSiteSettings } from "@/lib/site-settings";

export default async function AdminBoardsPage() {
  const [boards, settings] = await Promise.all([getBoards({ includeHidden: true }), getSiteSettings()]);
  const disabled = !settings.communityEnabled;

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-3xl">커뮤니티 게시판 관리</h1>
        <p className="text-sm text-gray-500 mt-2">
          커뮤니티 메뉴 하위에 표시될 게시판을 구성하세요.
        </p>
      </div>

      {disabled && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
          커뮤니티 기능이 비활성화되어 있습니다. 사이트 설정에서 커뮤니티 기능을
          활성화하면 게시판을 사용할 수 있습니다.
        </div>
      )}

      <BoardManager boards={boards} disabled={disabled} />
    </div>
  );
}
