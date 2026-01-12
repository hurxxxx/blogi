import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { mkdir, open, stat } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import sharp from "sharp";
import pngToIco from "png-to-ico";

const requireAdmin = async () => {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return null;
  }
  return session;
};

const allowedImageTypes = ["image/png", "image/jpeg", "image/webp"];
const allowedIcoTypes = ["image/x-icon", "image/vnd.microsoft.icon", "image/ico"];

const ensureDir = async (dir: string) => {
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }
};

const saveBuffer = async (dir: string, filename: string, buffer: Buffer) => {
  await ensureDir(dir);
  const filePath = path.join(dir, filename);
  const fileHandle = await open(filePath, "w");
  try {
    await fileHandle.writeFile(buffer);
    await fileHandle.sync();
  } finally {
    await fileHandle.close();
  }

  const maxRetries = 3;
  for (let i = 0; i < maxRetries; i++) {
    try {
      const fileStat = await stat(filePath);
      if (fileStat.size === buffer.length) {
        break;
      }
    } catch {
      if (i === maxRetries - 1) {
        throw new Error("File verification failed after write");
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
  return filePath;
};

export async function POST(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "관리자 권한이 필요합니다" }, { status: 403 });
  }

  const formData = await req.formData();
  const mode = (formData.get("mode") as string | null) || "auto";
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "파일이 없습니다" }, { status: 400 });
  }
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "파일 크기는 5MB를 초과할 수 없습니다" }, { status: 400 });
  }

  const uploadsRoot = process.env.UPLOADS_DIR || path.join(process.cwd(), "uploads");
  const baseUrl = (process.env.UPLOADS_URL || "/uploads").replace(/\/+$/, "");
  const now = new Date();
  const yyyy = String(now.getFullYear());
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const token = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  const scopedDir = path.join(uploadsRoot, "favicons", yyyy, mm, dd, token);

  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = path.extname(file.name).toLowerCase();

  if (mode === "auto") {
    if (!allowedImageTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "지원하지 않는 파일 형식입니다. (PNG/JPG/WebP만 가능)" },
        { status: 400 }
      );
    }

    const meta = await sharp(buffer).metadata();
    if (!meta.width || !meta.height || meta.width < 512 || meta.height < 512) {
      return NextResponse.json(
        { error: "512x512 이상 이미지를 업로드해주세요." },
        { status: 400 }
      );
    }

    const baseImage = sharp(buffer).resize(512, 512, { fit: "cover" }).png();
    const png512 = await baseImage.clone().png().toBuffer();
    const png192 = await baseImage.clone().resize(192, 192).png().toBuffer();
    const png32 = await baseImage.clone().resize(32, 32).png().toBuffer();
    const png16 = await baseImage.clone().resize(16, 16).png().toBuffer();
    const apple = await baseImage.clone().resize(180, 180).png().toBuffer();
    const ico = await pngToIco([png32, png16]);

    await saveBuffer(scopedDir, "favicon-16x16.png", png16);
    await saveBuffer(scopedDir, "favicon-32x32.png", png32);
    await saveBuffer(scopedDir, "android-chrome-192x192.png", png192);
    await saveBuffer(scopedDir, "android-chrome-512x512.png", png512);
    await saveBuffer(scopedDir, "apple-touch-icon.png", apple);
    await saveBuffer(scopedDir, "favicon.ico", ico as Buffer);

    return NextResponse.json({
      faviconPng16: `${baseUrl}/favicons/${yyyy}/${mm}/${dd}/${token}/favicon-16x16.png`,
      faviconPng32: `${baseUrl}/favicons/${yyyy}/${mm}/${dd}/${token}/favicon-32x32.png`,
      faviconAndroid192: `${baseUrl}/favicons/${yyyy}/${mm}/${dd}/${token}/android-chrome-192x192.png`,
      faviconAndroid512: `${baseUrl}/favicons/${yyyy}/${mm}/${dd}/${token}/android-chrome-512x512.png`,
      faviconAppleTouch: `${baseUrl}/favicons/${yyyy}/${mm}/${dd}/${token}/apple-touch-icon.png`,
      faviconIco: `${baseUrl}/favicons/${yyyy}/${mm}/${dd}/${token}/favicon.ico`,
    });
  }

  if (mode === "single") {
    const target = formData.get("target") as string | null;
    if (!target) {
      return NextResponse.json({ error: "대상 아이콘이 필요합니다." }, { status: 400 });
    }

    const sizeMap: Record<string, number | null> = {
      faviconPng16: 16,
      faviconPng32: 32,
      faviconAppleTouch: 180,
      faviconAndroid192: 192,
      faviconAndroid512: 512,
      faviconIco: null,
    };

    if (!(target in sizeMap)) {
      return NextResponse.json({ error: "지원하지 않는 대상입니다." }, { status: 400 });
    }

    if (target === "faviconIco") {
      if (!allowedIcoTypes.includes(file.type) && ext !== ".ico") {
        return NextResponse.json(
          { error: "favicon.ico 파일만 업로드할 수 있습니다." },
          { status: 400 }
        );
      }
      await saveBuffer(scopedDir, "favicon.ico", buffer);
      return NextResponse.json({
        url: `${baseUrl}/favicons/${yyyy}/${mm}/${dd}/${token}/favicon.ico`,
      });
    }

    if (!allowedImageTypes.includes(file.type) && ![".png", ".jpg", ".jpeg", ".webp"].includes(ext)) {
      return NextResponse.json(
        { error: "지원하지 않는 파일 형식입니다. (PNG/JPG/WebP만 가능)" },
        { status: 400 }
      );
    }

    const expected = sizeMap[target];
    const meta = await sharp(buffer).metadata();
    if (!meta.width || !meta.height || meta.width !== expected || meta.height !== expected) {
      return NextResponse.json(
        { error: `이미지 크기는 ${expected}x${expected}px 이어야 합니다.` },
        { status: 400 }
      );
    }

    const png = await sharp(buffer).png().toBuffer();
    const filenameMap: Record<string, string> = {
      faviconPng16: "favicon-16x16.png",
      faviconPng32: "favicon-32x32.png",
      faviconAppleTouch: "apple-touch-icon.png",
      faviconAndroid192: "android-chrome-192x192.png",
      faviconAndroid512: "android-chrome-512x512.png",
      faviconIco: "favicon.ico",
    };
    const filename = filenameMap[target];
    await saveBuffer(scopedDir, filename, png);

    return NextResponse.json({
      url: `${baseUrl}/favicons/${yyyy}/${mm}/${dd}/${token}/${filename}`,
    });
  }

  return NextResponse.json({ error: "지원하지 않는 요청입니다." }, { status: 400 });
}
