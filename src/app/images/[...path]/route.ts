import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params;
  if (!segments || segments.length === 0) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const requestedRel = segments.join("/");
  // Prevent directory traversal
  const safeRel = path.normalize(requestedRel).replace(/^(\.\.[\/\\])+/, "");
  const publicImagesDir = path.join(process.cwd(), "public", "images");
  const fullPath = path.join(publicImagesDir, safeRel);

  // If path doesn't start with publicImagesDir, return 404
  if (!fullPath.startsWith(publicImagesDir)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  // Extensions to attempt if the exact requested file is missing
  const possiblePaths = [fullPath];

  if (fullPath.endsWith(".jpg")) {
    possiblePaths.push(
      fullPath.replace(/\.jpg$/, ".jpeg"),
      fullPath.replace(/\.jpg$/, ".JPG"),
      fullPath.replace(/\.jpg$/, ".JPEG"),
      fullPath.replace(/\.jpg$/, ".png"),
      fullPath.replace(/\.jpg$/, ".webp")
    );
  } else if (fullPath.endsWith(".jpeg")) {
    possiblePaths.push(
      fullPath.replace(/\.jpeg$/, ".jpg"),
      fullPath.replace(/\.jpeg$/, ".JPEG"),
      fullPath.replace(/\.jpeg$/, ".JPG"),
      fullPath.replace(/\.jpeg$/, ".png"),
      fullPath.replace(/\.jpeg$/, ".webp")
    );
  } else if (fullPath.endsWith(".png")) {
    possiblePaths.push(
      fullPath.replace(/\.png$/, ".PNG"),
      fullPath.replace(/\.png$/, ".jpg"),
      fullPath.replace(/\.png$/, ".jpeg")
    );
  }

  for (const p of possiblePaths) {
    if (fs.existsSync(/*turbopackIgnore: true*/ p) && fs.statSync(/*turbopackIgnore: true*/ p).isFile()) {
      const buffer = fs.readFileSync(/*turbopackIgnore: true*/ p);
      const ext = path.extname(p).toLowerCase();
      let contentType = "image/jpeg";
      if (ext === ".png") contentType = "image/png";
      else if (ext === ".webp") contentType = "image/webp";
      else if (ext === ".gif") contentType = "image/gif";
      else if (ext === ".svg") contentType = "image/svg+xml";

      return new NextResponse(buffer, {
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }
  }

  return new NextResponse("Image Not Found", { status: 404 });
}
