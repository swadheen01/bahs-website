import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";
import { readFile, writeFile } from "fs/promises";
import path from "path";

const jsonPath = path.join(process.cwd(), "src", "data", "sliders.json");

async function readLocalSliders(): Promise<any[]> {
  try {
    const content = await readFile(jsonPath, "utf-8");
    return JSON.parse(content);
  } catch (e) {
    return [];
  }
}

async function writeLocalSliders(data: any[]) {
  try {
    await writeFile(jsonPath, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    // Ignore read-only filesystem on Vercel
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  const numId = Number(id);
  if (!isNaN(numId)) {
    try {
      const updateData: any = {};
      if (body.title !== undefined) updateData.title = body.title;
      if (body.image !== undefined) updateData.file_url = body.image;
      if (body.sort_order !== undefined) updateData.added_by = String(body.sort_order);

      await supabase
        .from("notices")
        .update(updateData)
        .eq("id", numId)
        .eq("type", "slider");
    } catch (e) {}
  }

  const local = await readLocalSliders();
  const index = local.findIndex((s: any) => String(s.id) === String(id));
  if (index !== -1) {
    local[index] = { ...local[index], ...body };
    await writeLocalSliders(local);
  }

  try {
    revalidatePath("/");
    revalidatePath("/dashboard/admin/sliders");
  } catch (e) {}

  try { revalidatePath("/", "layout"); } catch(e) {} return NextResponse.json({ success: true });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const numId = Number(id);
  if (!isNaN(numId)) {
    try {
      await supabase
        .from("notices")
        .delete()
        .eq("id", numId)
        .eq("type", "slider");
    } catch (e) {}
  }

  const local = await readLocalSliders();
  const filtered = local.filter((s: any) => String(s.id) !== String(id));
  await writeLocalSliders(filtered);

  try {
    revalidatePath("/");
    revalidatePath("/dashboard/admin/sliders");
  } catch (e) {}

  try { revalidatePath("/", "layout"); } catch(e) {} return NextResponse.json({ success: true });
}
