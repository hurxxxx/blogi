import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 설정 상태를 캐시하기 위한 변수
let setupCompleted: boolean | null = null;
let lastCheck = 0;
const CACHE_DURATION = 60000; // 1분 캐시

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 설정 페이지, API, 정적 파일은 제외
    if (
        pathname.startsWith("/setup") ||
        pathname.startsWith("/api") ||
        pathname.startsWith("/_next") ||
        pathname.startsWith("/favicon") ||
        pathname.includes(".")
    ) {
        return NextResponse.next();
    }

    // 캐시가 유효하면 캐시된 값 사용
    const now = Date.now();
    if (setupCompleted !== null && now - lastCheck < CACHE_DURATION) {
        if (!setupCompleted) {
            return NextResponse.redirect(new URL("/setup", request.url));
        }
        return NextResponse.next();
    }

    // API로 설정 상태 확인
    try {
        const response = await fetch(new URL("/api/setup", request.url));
        const data = await response.json();
        setupCompleted = !data.needsSetup;
        lastCheck = now;

        if (data.needsSetup) {
            return NextResponse.redirect(new URL("/setup", request.url));
        }
    } catch {
        // API 호출 실패 시 그냥 통과
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        "/((?!api|_next/static|_next/image|favicon.ico).*)",
    ],
};
