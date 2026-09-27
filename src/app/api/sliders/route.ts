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

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("sliders")
      .select("*")
      .order("sort_order", { ascending: true });

    if (!error && Array.isArray(data) && data.length > 0) {
      return NextResponse.json(data);
    }
  } catch (e) {
    // Fall back to local file
  }

  const local = await readLocalSliders();
  local.sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0));
  return NextResponse.json(local);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const local = await readLocalSliders();

    const newSlide = {
      id: Date.now(),
      title: body.title,
      image: body.image,
      sort_order: body.sort_order || local.length + 1,
    };

    // Try saving to Supabase first
    try {
      const { data, error } = await supabase.from("sliders").insert([body]).select();
      if (!error && data && data.length > 0) {
        newSlide.id = data[0].id;
      }
    } catch (e) {
      // Ignore Supabase RLS error
    }

    // Always persist to local sliders.json
    local.push(newSlide);
    local.sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0));
    await writeLocalSliders(local);

    return NextResponse.json(newSlide);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Bulk update / Reorder sliders
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const items: any[] = Array.isArray(body) ? body : body.sliders;

    if (!Array.isArray(items)) {
      return NextResponse.json({ error: "Invalid array of sliders" }, { status: 400 });
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

    // Also update Supabase in background
    try {
      for (const [id, order] of orderMap.entries()) {
        await supabase.from("sliders").update({ sort_order: order }).eq("id", id);
      }
    } catch (e) {
      // Ignore Supabase errors
    }

    return NextResponse.json({ success: true, sliders: local });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
