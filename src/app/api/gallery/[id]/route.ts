import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { readFile, writeFile } from "fs/promises";
import path from "path";

const jsonPath = path.join(process.cwd(), "src", "data", "gallery.json");

async function readLocalGallery() {
  try {
    const content = await readFile(jsonPath, "utf-8");
    const data = JSON.parse(content);
    return data.map((item: any) => ({
      id: item.id,
      title: item.caption || item.title,
      image: item.src || item.image,
      created_at: item.date || new Date().toISOString(),
    }));
  } catch (e) {
    return [];
  }
}

async function writeLocalGallery(data: any[]) {
  try {
    const formatted = data.map((item: any) => ({
      id: item.id,
      src: item.image,
      caption: item.title,
      category: "event",
      date: item.created_at || "২০২৬",
    }));
    await writeFile(jsonPath, JSON.stringify(formatted, null, 2), "utf-8");
  } catch (e) {
    console.error("Local gallery write error:", e);
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const updateData: any = {};
  if (body.title !== undefined) updateData.caption = body.title;
  if (body.image !== undefined) updateData.src = body.image;

  try {
    await supabase.from("gallery_photos").update(updateData).eq("id", id);
  } catch (e) {}

  const local = await readLocalGallery();
  const index = local.findIndex((item: any) => String(item.id) === String(id));
  if (index !== -1) {
    local[index] = { ...local[index], ...body };
    await writeLocalGallery(local);
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    await supabase.from("gallery_photos").delete().eq("id", id);
  } catch (e) {}

  const local = await readLocalGallery();
  const filtered = local.filter((item: any) => String(item.id) !== String(id));
  await writeLocalGallery(filtered);

  return NextResponse.json({ success: true });
}
