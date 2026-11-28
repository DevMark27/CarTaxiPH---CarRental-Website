import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { PRIVATE_UPLOADS_DIR } from "@/lib/bookings";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

function detectVerifiedFileType(buf: Buffer): { ext: ".jpg" | ".png" | ".pdf"; mime: string } | null {
  if (buf.length < 5) return null;
  // JPEG magic bytes: FF D8 FF
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return { ext: ".jpg", mime: "image/jpeg" };
  }
  // PNG magic bytes: 89 50 4E 47 0D 0A 1A 0A
  if (
    buf.length >= 8 &&
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47 &&
    buf[4] === 0x0d &&
    buf[5] === 0x0a &&
    buf[6] === 0x1a &&
    buf[7] === 0x0a
  ) {
    return { ext: ".png", mime: "image/png" };
  }
  // PDF magic bytes: %PDF-
  if (buf.subarray(0, 5).toString("ascii") === "%PDF-") {
    return { ext: ".pdf", mime: "application/pdf" };
  }
  return null;
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limit = checkRateLimit(`upload:${ip}`, 15, 10 * 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many file uploads. Please wait a moment and try again." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    if (file.size <= 0 || file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "File size must be between 1 byte and 5 MB." },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const verified = detectVerifiedFileType(buffer);
    if (!verified) {
      return NextResponse.json(
        { error: "Invalid or unsupported file content. Only real JPG, PNG, or PDF files are accepted." },
        { status: 400 },
      );
    }

    if (!fs.existsSync(PRIVATE_UPLOADS_DIR)) {
      fs.mkdirSync(PRIVATE_UPLOADS_DIR, { recursive: true });
    }

    const id = crypto.randomUUID();
    const storedName = `${id}${verified.ext}`;
    const destPath = path.join(/* turbopackIgnore: true */ PRIVATE_UPLOADS_DIR, storedName);
    fs.writeFileSync(destPath, buffer);

    const safeOriginalName = path.basename(file.name).slice(0, 120) || storedName;

    return NextResponse.json({
      id,
      originalName: safeOriginalName,
      storedName,
      mimeType: verified.mime,
      size: file.size,
      uploadedAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ error: "Failed to upload document securely." }, { status: 500 });
  }
}
