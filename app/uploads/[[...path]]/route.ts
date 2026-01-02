import { NextRequest, NextResponse } from "next/server";
import { readFile, stat } from "fs/promises";
import path from "path";

const MIME_TYPES: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
};

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ path?: string[] }> }
) {
    const { path: pathSegments } = await params;

    if (!pathSegments || pathSegments.length === 0) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const uploadsRoot =
        process.env.UPLOADS_DIR || path.join(process.cwd(), "uploads");
    const resolvedRoot = path.resolve(uploadsRoot);
    const resolvedPath = path.resolve(resolvedRoot, ...pathSegments);

    // Security: prevent path traversal
    const relativePath = path.relative(resolvedRoot, resolvedPath);
    if (
        relativePath === ".." ||
        relativePath.startsWith(`..${path.sep}`) ||
        path.isAbsolute(relativePath)
    ) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const fileStat = await stat(resolvedPath);
        if (!fileStat.isFile()) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        const ext = path.extname(resolvedPath).toLowerCase();
        const contentType = MIME_TYPES[ext] || "application/octet-stream";

        const fileBuffer = await readFile(resolvedPath);

        return new NextResponse(fileBuffer, {
            status: 200,
            headers: {
                "Content-Type": contentType,
                "Content-Length": String(fileStat.size),
                "Cache-Control": "public, max-age=31536000, immutable",
            },
        });
    } catch {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
}
