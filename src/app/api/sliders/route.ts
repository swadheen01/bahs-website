import { NextResponse } from "next/server";
import { revalidatePath } from "@/lib/legacy-cache";
import { supabase } from "@/lib/supabase";
import { readFile, writeFile } from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

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

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("notices")
      .select("*")
      .eq("type", "slider")
      .order("id", { ascending: true });

    if (!error && Array.isArray(data)) {
      const sliders = data.map((s: any) => ({
        id: s.id,
        title: s.title || "",
        image: s.file_url,
        sort_order: Number(s.added_by) || 0,
      }));
      sliders.sort((a, b) => a.sort_order - b.sort_order);
      return NextResponse.json(sliders);
    }
  } catch (e) {}

  const local = await readLocalSliders();
  local.sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0));
  return NextResponse.json(local);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const local = await readLocalSliders();
    const newId = Date.now() % 2147483647;
    const sortOrder = body.sort_order !== undefined ? body.sort_order : local.length + 1;

    const newSlide = {
      id: newId,
      title: body.title || "",
      image: body.image,
      sort_order: sortOrder,
    };

    // Save to Supabase notices table where type='slider'
    try {
      await supabase.from("notices").insert({
        id: newId,
        title: body.title || "",
        file_url: body.image,
        type: "slider",
        added_by: String(sortOrder),
        date: new Date().toLocaleDateString("bn-BD"),
        date_iso: new Date().toISOString(),
        is_new: false,
      });
    } catch (e) {
      console.error("Supabase slider insert error:", e);
    }

    // Persist to local sliders.json if filesystem is writable
    local.push(newSlide);
    local.sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0));
    await writeLocalSliders(local);

    try {
      revalidatePath("/");
      revalidatePath("/dashboard/admin/sliders");
    } catch (e) {}

    try { revalidatePath("/", "layout"); } catch(e) {} return NextResponse.json(newSlide);
  } catch (err: any) {
    try { revalidatePath("/", "layout"); } catch(e) {} return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Bulk update / Reorder sliders
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const items: any[] = Array.isArray(body) ? body : body.sliders;

    if (!Array.isArray(items)) {
      try { revalidatePath("/", "layout"); } catch(e) {} return NextResponse.json({ error: "Invalid array of sliders" }, { status: 400 });
    }

    const local = await readLocalSliders();
    const orderMap = new Map<string, number>();

    items.forEach((item, index) => {
      const order = typeof item.sort_order === "number" ? item.sort_order : index + 1;
      orderMap.set(String(item.id), order);
    });

    for (const slide of local) {
      if (orderMap.has(String(slide.id))) {
        slide.sort_order = orderMap.get(String(slide.id))!;
      }
    }

    local.sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0));
    await writeLocalSliders(local);

    // Also update Supabase notices table where type='slider'
    try {
      for (const [id, order] of orderMap.entries()) {
        const numId = Number(id);
        if (!isNaN(numId)) {
          await supabase
            .from("notices")
            .update({ added_by: String(order) })
            .eq("id", numId)
            .eq("type", "slider");
        }
      }
    } catch (e) {
      console.error("Supabase slider bulk update error:", e);
    }

    try {
      revalidatePath("/");
      revalidatePath("/dashboard/admin/sliders");
    } catch (e) {}

    try { revalidatePath("/", "layout"); } catch(e) {} return NextResponse.json({ success: true, sliders: local });
  } catch (err: any) {
    try { revalidatePath("/", "layout"); } catch(e) {} return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
