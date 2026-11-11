import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";
import { readFile, writeFile } from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

const jsonPath = path.join(process.cwd(), "src", "data", "sliders.json");

async function readLocalSliders(): Promise<any[]> {
  try {
    const content = await readFile(jsonPath, "utf-8");
    return JSON.parse(content);
  } catch {
    return [];
  }
}

async function writeLocalSliders(data: any[]) {
  try {
    await writeFile(jsonPath, JSON.stringify(data, null, 2), "utf-8");
  } catch {
    // Ignore read-only filesystem on serverless/Cloudflare
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const numId = Number(id);
    if (!Number.isInteger(numId) || numId <= 0) {
      return NextResponse.json({ error: "Invalid slider id" }, { status: 400 });
    }

    const body = await req.json();
    const todayISO = new Date().toISOString().split("T")[0];
    const updateData: any = { date_iso: todayISO };
    if (body.title !== undefined) updateData.title = String(body.title).trim();
    if (body.image !== undefined) updateData.file_url = String(body.image).trim();
    if (body.sort_order !== undefined) updateData.added_by = String(body.sort_order);

    const { error } = await supabase
      .from("notices")
      .update(updateData)
      .eq("id", numId)
      .eq("type", "slider");

    if (error) {
      return NextResponse.json({ error: `স্লাইডার আপডেট ব্যর্থ হয়েছে: ${error.message}` }, { status: 500 });
    }

    const local = await readLocalSliders();
    const index = local.findIndex((s: any) => String(s.id) === String(id));
    if (index !== -1) {
      local[index] = { ...local[index], ...body };
      await writeLocalSliders(local);
    }

    try {
      revalidatePath("/");
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
      return NextResponse.json({ error: "Invalid slider id" }, { status: 400 });
    }

    const { error } = await supabase
      .from("notices")
      .delete()
      .eq("id", numId)
      .eq("type", "slider");

    if (error) {
      return NextResponse.json({ error: `স্লাইডার মুছে ফেলা ব্যর্থ হয়েছে: ${error.message}` }, { status: 500 });
    }

    const local = await readLocalSliders();
    const filtered = local.filter((s: any) => String(s.id) !== String(id));
    await writeLocalSliders(filtered);

    try {
      revalidatePath("/");
    } catch {}

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Server error" }, { status: 500 });
  }
}
