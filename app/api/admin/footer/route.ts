import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const requireAdmin = async () => {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return null;
  }
  return session;
};

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "관리자 권한이 필요합니다" }, { status: 403 });
  }

  const body = await req.json();
  const {
    footerEnabled,
    copyrightText,
    showCopyright,
    termsContent,
    termsContentMarkdown,
    privacyContent,
    privacyContentMarkdown,
    showTerms,
    showPrivacy,
    businessLines,
    showBusinessInfo,
    socialLinks,
    showSocials,
  } = body;

  const data = {
    footerEnabled: Boolean(footerEnabled),
    copyrightText:
      typeof copyrightText === "string" && copyrightText.trim() ? copyrightText.trim() : null,
    showCopyright: Boolean(showCopyright),
    termsContent: typeof termsContent === "string" && termsContent.trim() ? termsContent : null,
    termsContentMarkdown:
      typeof termsContentMarkdown === "string" && termsContentMarkdown.trim()
        ? termsContentMarkdown
        : null,
    privacyContent: typeof privacyContent === "string" && privacyContent.trim() ? privacyContent : null,
    privacyContentMarkdown:
      typeof privacyContentMarkdown === "string" && privacyContentMarkdown.trim()
        ? privacyContentMarkdown
        : null,
    showTerms: Boolean(showTerms),
    showPrivacy: Boolean(showPrivacy),
    businessLines: Array.isArray(businessLines) ? businessLines.slice(0, 4) : [],
    showBusinessInfo: Boolean(showBusinessInfo),
    showSocials: Boolean(showSocials),
    socialLinks: Array.isArray(socialLinks) ? socialLinks : [],
  };

  const settings = await prisma.siteSettings.upsert({
    where: { key: "default" },
    update: data,
    create: {
      key: "default",
      ...data,
    },
  });

  return NextResponse.json(settings);
}
