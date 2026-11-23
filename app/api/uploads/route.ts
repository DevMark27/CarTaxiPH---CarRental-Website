import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { PRIVATE_UPLOADS_DIR } from "@/lib/bookings";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "application/pdf",
]);
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Unsupported file format. Please upload JPG, JPEG, PNG, or PDF." },
        { status: 400 },
      );
    }

    if (file.size <= 0 || file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "File size must be between 1 byte and 5 MB." },
        { status: 400 },
      );
    }

    if (!fs.existsSync(PRIVATE_UPLOADS_DIR)) {
      fs.mkdirSync(PRIVATE_UPLOADS_DIR, { recursive: true });
    }

    const ext = path.extname(file.name).toLowerCase() || (file.type === "application/pdf" ? ".pdf" : ".jpg");
    const id = crypto.randomUUID();
    const storedName = `${id}${ext}`;
    const destPath = path.join(PRIVATE_UPLOADS_DIR, storedName);

    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(destPath, buffer);

    return NextResponse.json({
      id,
      originalName: file.name,
      storedName,
      mimeType: file.type,
      size: file.size,
      uploadedAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ error: "Failed to upload document securely." }, { status: 500 });
  }
}
