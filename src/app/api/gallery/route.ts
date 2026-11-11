import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { readFile, writeFile } from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

const jsonPath = path.join(process.cwd(), "src", "data", "gallery.json");
const PUBLIC_CACHE_HEADER = { "Cache-Control": "no-cache, max-age=0, must-revalidate" };

function generateUniqueGalleryId(existingIds: Set<number>): number {
  let candidate = (Date.now() % 2000000000) + 1000000;
  if (candidate > 2147483647) candidate = (candidate % 2000000000) + 1000000;
  while (existingIds.has(candidate)) {
    candidate = candidate >= 2147483646 ? 1860000100 : candidate + 1;
  }
  return candidate;
}

async function readLocalGallery(): Promise<any[]> {
  try {
    const content = await readFile(jsonPath, "utf-8");
    const data = JSON.parse(content);
    return data.map((item: any) => ({
      id: item.id,
      title: item.caption || item.title || "গ্যালারি ছবি",
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

async function fetchGalleryFromSupabase() {
  const { data, error } = await supabase
    .from("notices")
    .select("*")
    .eq("type", "gallery")
    .order("id", { ascending: false });

  if (error) throw error;

  return (data || []).map((item: any) => ({
    id: item.id,
    title: item.title || "গ্যালারি ছবি",
    image: item.file_url,
    category: item.added_by || "campus",
    date: item.date || "২০২৬",
    created_at: item.date_iso || item.date || new Date().toISOString().split("T")[0],
  }));
}

export async function GET() {
  try {
    const items = await fetchGalleryFromSupabase();
    return NextResponse.json(items, { headers: PUBLIC_CACHE_HEADER });
  } catch (e) {
    console.error("Supabase gallery fetch error, falling back to local JSON:", e);
  }

  const local = await readLocalGallery();
  return NextResponse.json(local, { headers: PUBLIC_CACHE_HEADER });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const image = String(body.image || "").trim();
    if (!image) {
      return NextResponse.json({ error: "গ্যালারির ছবি আবশ্যক" }, { status: 400 });
    }

    const { data: existingRows, error: listErr } = await supabase
      .from("notices")
      .select("id")
      .eq("type", "gallery");

    if (listErr) {
      return NextResponse.json({ error: `ডাটাবেজ সংযোগ ব্যর্থ হয়েছে: ${listErr.message}` }, { status: 500 });
    }

    const existingIds = new Set<number>((existingRows || []).map((r: any) => Number(r.id)));
    const newId = generateUniqueGalleryId(existingIds);
    const safeTitle = String(body.title || "").trim() || "গ্যালারি ছবি";
    const safeCategory = String(body.category || "campus").trim() || "campus";
    const todayISO = new Date().toISOString().split("T")[0];

    const { error: insertErr } = await supabase.from("notices").insert({
      id: newId,
      title: safeTitle,
      file_url: image,
      type: "gallery",
      added_by: safeCategory,
      date: todayISO,
      date_iso: todayISO,
      is_new: false,
    });

    if (insertErr) {
      return NextResponse.json({ error: `ছবি সংরক্ষণ ব্যর্থ হয়েছে: ${insertErr.message}` }, { status: 500 });
    }

    const newItem = {
      id: newId,
      title: safeTitle,
      image,
      category: safeCategory,
      date: todayISO,
      created_at: todayISO,
    };

    try {
      const latest = await fetchGalleryFromSupabase();
      await writeLocalGallery(latest);
    } catch {}

    try {
      revalidatePath("/gallery/photos");
    } catch {}

    return NextResponse.json(newItem);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
