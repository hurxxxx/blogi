import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getBoards } from "@/lib/boards";
import { getSiteSettings } from "@/lib/site-settings";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const includeHidden = searchParams.get("all") === "true";
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN";
  const settings = await getSiteSettings();

  if (!settings.communityEnabled && !isAdmin) {
    return NextResponse.json({ error: "커뮤니티 기능이 비활성화되어 있습니다." }, { status: 403 });
  }

  const boards = await getBoards({ includeHidden: includeHidden && isAdmin });
  return NextResponse.json(boards);
}
