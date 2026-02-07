import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  // 1) Verify admin via Authorization header (Firebase Admin verifyIdToken, etc.)
  // const authHeader = req.headers.get("authorization") ?? "";
  // ... verify authHeader ...

  // 2) Read multipart form
  const form = await req.formData();

  const metaRaw = form.get("meta");
  const meta = metaRaw ? JSON.parse(String(metaRaw)) : null;

  const files = form.getAll("files").filter(Boolean) as File[];

  // 3) Convert each File to a Buffer (this is the “octet stream buffer” you want)
  const buffers = await Promise.all(
    files.map(async (f) => ({
      fileName: f.name,
      contentType: f.type || "application/octet-stream",
      size: f.size,
      buffer: Buffer.from(await f.arrayBuffer()),
    }))
  );

  // 4) Stub: hand off to your existing Firebase Storage upload logic
  // const uploaded = await uploadAllToStorage(buffers, meta);

  return NextResponse.json({
    ok: true,
    meta,
    images: buffers.map((b, i) => ({
      id: ["primary", "secondary", "downscale"][i] ?? `img${i}`,
      fileName: b.fileName,
      contentType: b.contentType,
      size: b.size,
      // path/url filled by your backend uploader
      path: null,
      url: null,
    })),
  });
}
