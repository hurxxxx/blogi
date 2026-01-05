import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const EXCLUDED_PREFIXES = ["/api", "/_next"];
const PUBLIC_FILE = /\.(.*)$/;

type AclResponse = {
  protectedCategorySlugs: string[];
  protectedCommunitySlugs: string[];
};

const getProtectedSlugs = async (req: NextRequest) => {
  try {
    const res = await fetch(new URL("/api/acl", req.nextUrl.origin), {
      headers: {
        "x-middleware-request": "1",
      },
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return (await res.json()) as AclResponse;
  } catch {
    return null;
  }
};

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (EXCLUDED_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }
  if (PUBLIC_FILE.test(pathname)) {
    return NextResponse.next();
  }
  if (pathname === "/login" || pathname === "/register" || pathname === "/setup") {
    return NextResponse.next();
  }

  const isContentRoute = pathname.startsWith("/contents/");
  const isCommunityRoute = pathname.startsWith("/community/");
  if (!isContentRoute && !isCommunityRoute) {
    return NextResponse.next();
  }

  const authSecret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  if (!authSecret) {
    return NextResponse.next();
  }

  const token = await getToken({
    req,
    secret: authSecret,
  });
  if (token) {
    return NextResponse.next();
  }

  const parts = pathname.split("/").filter(Boolean);
  const slug = parts[1];
  if (!slug) {
    return NextResponse.next();
  }

  const acl = await getProtectedSlugs(req);
  if (!acl) {
    return NextResponse.next();
  }

  const isProtected = isContentRoute
    ? acl.protectedCategorySlugs.includes(slug)
    : acl.protectedCommunitySlugs.includes(slug);

  if (!isProtected) {
    return NextResponse.next();
  }

  const loginUrl = req.nextUrl.clone();
  loginUrl.pathname = "/login";
  loginUrl.searchParams.set("callbackUrl", `${req.nextUrl.pathname}${req.nextUrl.search}`);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/contents/:path*", "/community/:path*"],
};
