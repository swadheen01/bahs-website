import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "কোনো ফাইল পাওয়া যায়নি" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Sanitize and create unique file name
    const timestamp = Date.now();
    const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const fileName = `${timestamp}_${cleanName}`;
    const mimeType = file.type || "application/octet-stream";

    let publicUrl = "";

    // On Vercel / read-only production: convert to Data URL so files are immediately accessible and persistent
    if (process.env.VERCEL) {
      publicUrl = `data:${mimeType};base64,${buffer.toString("base64")}`;
    } else {
      // In local development: write to public/uploads
      try {
        const uploadDir = path.join(process.cwd(), "public", "uploads");
        await mkdir(uploadDir, { recursive: true });
        const filePath = path.join(uploadDir, fileName);
        await writeFile(filePath, buffer);
        publicUrl = `/uploads/${fileName}`;
      } catch (fsErr) {
        // Fallback to Data URL if local filesystem is read-only
        publicUrl = `data:${mimeType};base64,${buffer.toString("base64")}`;
      }
    }

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName,
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "ফাইল আপলোড ব্যর্থ হয়েছে: " + (error?.message || "") }, { status: 500 });
  }
}
