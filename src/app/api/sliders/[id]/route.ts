import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { readFile, writeFile } from "fs/promises";
import path from "path";

const jsonPath = path.join(process.cwd(), "src", "data", "sliders.json");

async function readLocalSliders() {
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
    console.error("Local slider write error:", e);
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  try {
    await supabase.from("sliders").update(body).eq("id", id);
  } catch (e) {}

  const local = await readLocalSliders();
  const index = local.findIndex((s: any) => String(s.id) === String(id));
  if (index !== -1) {
    local[index] = { ...local[index], ...body };
    await writeLocalSliders(local);
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    await supabase.from("sliders").delete().eq("id", id);
  } catch (e) {}

  const local = await readLocalSliders();
  const filtered = local.filter((s: any) => String(s.id) !== String(id));
  await writeLocalSliders(filtered);

  return NextResponse.json({ success: true });
}
