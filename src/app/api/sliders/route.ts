import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";
import { readFile, writeFile } from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

const jsonPath = path.join(process.cwd(), "src", "data", "sliders.json");
const PUBLIC_CACHE_HEADER = { "Cache-Control": "no-cache, max-age=0, must-revalidate" };

function generateUniqueSliderId(existingIds: Set<number>): number {
  let candidate = (Date.now() % 2000000000) + 1000000;
  if (candidate > 2147483647) candidate = (candidate % 2000000000) + 1000000;
  while (existingIds.has(candidate)) {
    candidate = candidate >= 2147483646 ? 1850000100 : candidate + 1;
  }
  return candidate;
}

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

async function fetchSlidersFromSupabase() {
  const { data, error } = await supabase
    .from("notices")
    .select("*")
    .eq("type", "slider")
    .order("id", { ascending: true });

  if (error) throw error;

  const sliders = (data || []).map((s: any) => ({
    id: s.id,
    title: s.title || "",
    image: s.file_url,
    sort_order: Number(s.added_by) || 0,
  }));
  sliders.sort((a, b) => a.sort_order - b.sort_order || Number(a.id) - Number(b.id));
  return sliders;
}

export async function GET() {
  try {
    const sliders = await fetchSlidersFromSupabase();
    return NextResponse.json(sliders, { headers: PUBLIC_CACHE_HEADER });
  } catch (e) {
    console.error("Supabase sliders fetch error, falling back to local JSON:", e);
  }

  const local = await readLocalSliders();
  local.sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0));
  return NextResponse.json(local, { headers: PUBLIC_CACHE_HEADER });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const image = String(body.image || "").trim();
    if (!image) {
      return NextResponse.json({ error: "স্লাইডারের ছবি আবশ্যক" }, { status: 400 });
    }

    const { data: existingRows, error: listErr } = await supabase
      .from("notices")
      .select("id, added_by")
      .eq("type", "slider");

    if (listErr) {
      return NextResponse.json({ error: `ডাটাবেজ সংযোগ ব্যর্থ হয়েছে: ${listErr.message}` }, { status: 500 });
    }

    const existingIds = new Set<number>((existingRows || []).map((r: any) => Number(r.id)));
    const newId = generateUniqueSliderId(existingIds);
    const maxOrder = (existingRows || []).reduce(
      (max, r: any) => Math.max(max, Number(r.added_by) || 0),
      0
    );
    const sortOrder = body.sort_order !== undefined ? Number(body.sort_order) : maxOrder + 1;
    const todayISO = new Date().toISOString().split("T")[0];

    const { error: insertErr } = await supabase.from("notices").insert({
      id: newId,
      title: String(body.title || "").trim(),
      file_url: image,
      type: "slider",
      added_by: String(sortOrder),
      date: todayISO,
      date_iso: todayISO,
      is_new: false,
    });

    if (insertErr) {
      return NextResponse.json({ error: `স্লাইডার সংরক্ষণ ব্যর্থ হয়েছে: ${insertErr.message}` }, { status: 500 });
    }

    const newSlide = {
      id: newId,
      title: String(body.title || "").trim(),
      image,
      sort_order: sortOrder,
    };

    try {
      const latest = await fetchSlidersFromSupabase();
      await writeLocalSliders(latest);
    } catch {}

    try {
      revalidatePath("/");
    } catch {}

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

    const todayISO = new Date().toISOString().split("T")[0];

    for (let index = 0; index < items.length; index++) {
      const item = items[index];
      const order = typeof item.sort_order === "number" ? item.sort_order : index + 1;
      const numId = Number(item.id);
      if (!Number.isInteger(numId) || numId <= 0) {
        return NextResponse.json({ error: "Invalid slider id in reorder payload" }, { status: 400 });
      }
      const { error: updateErr } = await supabase
        .from("notices")
        .update({ added_by: String(order), date_iso: todayISO })
        .eq("id", numId)
        .eq("type", "slider");

      if (updateErr) {
        return NextResponse.json({ error: `ক্রম আপডেট ব্যর্থ হয়েছে: ${updateErr.message}` }, { status: 500 });
      }
    }

    let latestSliders: any[] = items;
    try {
      latestSliders = await fetchSlidersFromSupabase();
      await writeLocalSliders(latestSliders);
    } catch {}

    try {
      revalidatePath("/");
    } catch {}

    return NextResponse.json({ success: true, sliders: latestSliders });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
