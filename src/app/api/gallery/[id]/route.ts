import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { readFile, writeFile } from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

const jsonPath = path.join(process.cwd(), "src", "data", "gallery.json");

async function readLocalGallery() {
  try {
    const content = await readFile(jsonPath, "utf-8");
    const data = JSON.parse(content);
    return data.map((item: any) => ({
      id: item.id,
      title: item.caption || item.title,
      image: item.src || item.image,
      category: item.category || "campus",
      date: item.date || "২০২৬",
      created_at: item.date || new Date().toISOString().split("T")[0],
    }));
  } catch {
    return [];
  }
}

async function writeLocalGallery(data: any[]) {
  try {
    const formatted = data.map((item: any) => ({
      id: item.id,
      src: item.image,
      caption: item.title,
      category: item.category || "campus",
      date: item.date || item.created_at || "২০২৬",
    }));
    await writeFile(jsonPath, JSON.stringify(formatted, null, 2), "utf-8");
  } catch {
    // Ignore read-only filesystem on serverless/Cloudflare
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const numId = Number(id);
    if (!Number.isInteger(numId) || numId <= 0) {
      return NextResponse.json({ error: "Invalid gallery id" }, { status: 400 });
    }

    const body = await req.json();
    const todayISO = new Date().toISOString().split("T")[0];
    const updateData: any = { date_iso: todayISO };
    if (body.title !== undefined) updateData.title = String(body.title).trim();
    if (body.image !== undefined) updateData.file_url = String(body.image).trim();
    if (body.category !== undefined) updateData.added_by = String(body.category).trim() || "campus";

    const { error } = await supabase
      .from("notices")
      .update(updateData)
      .eq("id", numId)
      .eq("type", "gallery");

    if (error) {
      return NextResponse.json({ error: `ছবি আপডেট ব্যর্থ হয়েছে: ${error.message}` }, { status: 500 });
    }

    const local = await readLocalGallery();
    const index = local.findIndex((item: any) => String(item.id) === String(id));
    if (index !== -1) {
      local[index] = { ...local[index], ...body };
      await writeLocalGallery(local);
    }

    try {
      revalidatePath("/gallery/photos");
    } catch {}

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Server error" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const numId = Number(id);
    if (!Number.isInteger(numId) || numId <= 0) {
      return NextResponse.json({ error: "Invalid gallery id" }, { status: 400 });
    }

    const { error } = await supabase
      .from("notices")
      .delete()
      .eq("id", numId)
      .eq("type", "gallery");

    if (error) {
      return NextResponse.json({ error: `ছবি মুছে ফেলা ব্যর্থ হয়েছে: ${error.message}` }, { status: 500 });
    }

    const local = await readLocalGallery();
    const filtered = local.filter((item: any) => String(item.id) !== String(id));
    await writeLocalGallery(filtered);

    try {
      revalidatePath("/gallery/photos");
    } catch {}

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Server error" }, { status: 500 });
  }
}
