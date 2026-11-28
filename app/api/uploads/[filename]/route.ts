import fs from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { isAdminAuthorized, PRIVATE_UPLOADS_DIR } from "@/lib/bookings";

const SAFE_STORED_NAME = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|pdf)$/i;

const MIME_MAP: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".pdf": "application/pdf",
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ filename: string }> },
) {
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { filename } = await params;
  const safeName = path.basename(filename);
  if (!SAFE_STORED_NAME.test(safeName)) {
    return NextResponse.json({ error: "Invalid document identifier" }, { status: 400 });
  }

  const filePath = path.join(/* turbopackIgnore: true */ PRIVATE_UPLOADS_DIR, safeName);
  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  const ext = path.extname(safeName).toLowerCase();
  const contentType = MIME_MAP[ext] ?? "application/octet-stream";
  const fileBuffer = fs.readFileSync(filePath);

  return new NextResponse(fileBuffer, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `inline; filename="${safeName}"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'",
    },
  });
}
