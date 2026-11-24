import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/serverAuth";
import { getSupabaseAdmin, hasServiceRoleKey } from "@/lib/supabaseServer";

const MAX_BYTES = 6 * 1024 * 1024;
const STORAGE_BUCKET = "uploads";
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv",
]);

export async function POST(req: NextRequest) {
  // Only signed-in admins and teachers (teacher profile photo) may upload.
  const denied = await requireRole("admin", "teacher");
  if (denied) return denied;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "কোনো ফাইল পাওয়া যায়নি" }, { status: 400 });
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "ফাইলের আকার ৬ মেগাবাইটের বেশি হতে পারবে না (সর্বোচ্চ 6MB অনুমোদিত)" },
        { status: 400 }
      );
    }

    const mimeType = file.type || "application/octet-stream";
    if (!ALLOWED_TYPES.has(mimeType)) {
      return NextResponse.json({ error: "এই ধরনের ফাইল আপলোড করা যাবে না" }, { status: 400 });
    }

    const cleanName = (file.name || "file").replace(/[^a-zA-Z0-9.-]/g, "_").slice(-80);
    const fileName = `${Date.now()}_${crypto.randomUUID().slice(0, 8)}_${cleanName}`;

    // Local development: save into public/uploads.
    if (process.env.NODE_ENV !== "production") {
      try {
        const { writeFile, mkdir } = await import("fs/promises");
        const path = await import("path");
        const uploadDir = path.join(process.cwd(), "public", "uploads");
        await mkdir(uploadDir, { recursive: true });
        await writeFile(path.join(uploadDir, fileName), Buffer.from(await file.arrayBuffer()));
        return NextResponse.json({ success: true, url: `/uploads/${fileName}`, fileName });
      } catch {
        // fall through to storage / data URL
      }
    }

    // Production: store the file in Supabase Storage and save only its URL in the database.
    // (Base64 data URLs inside DB rows made every API response huge and cost a lot of Worker CPU.)
    if (hasServiceRoleKey()) {
      const supabase = getSupabaseAdmin();
      const { error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(fileName, file, { contentType: mimeType, cacheControl: "31536000", upsert: false });
      if (!error) {
        const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(fileName);
        return NextResponse.json({ success: true, url: data.publicUrl, fileName });
      }
      console.error("Supabase Storage upload failed, falling back to data URL:", error.message);
    }

    // Legacy fallback (until the storage bucket / service key are configured).
    const base64 = Buffer.from(await file.arrayBuffer()).toString("base64");
    return NextResponse.json({ success: true, url: `data:${mimeType};base64,${base64}`, fileName });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "ফাইল আপলোড ব্যর্থ হয়েছে" }, { status: 500 });
  }
}
