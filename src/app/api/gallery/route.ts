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
    // Ignore read-only filesystem on Vercel
  }
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("notices")
      .select("*")
      .eq("type", "gallery")
      .order("id", { ascending: false });

    if (!error && Array.isArray(data) && data.length > 0) {
      const items = data.map((item: any) => ({
        id: item.id,
        title: item.title,
        image: item.file_url,
        created_at: item.date_iso || item.date || new Date().toISOString(),
      }));
      return NextResponse.json(items);
    }
  } catch (e) {}

  const local = await readLocalGallery();
  return NextResponse.json(local);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const local = await readLocalGallery();
    const newId = Date.now() % 2147483647;

    const newItem = {
      id: newId,
      title: body.title,
      image: body.image,
      created_at: new Date().toISOString(),
    };

    try {
      await supabase.from("notices").insert({
        id: newId,
        title: body.title,
        file_url: body.image,
        type: "gallery",
        added_by: "campus",
        date: new Date().toLocaleDateString("bn-BD"),
        date_iso: newItem.created_at,
        is_new: false,
      });
    } catch (e) {
      console.error("Supabase gallery insert error:", e);
    }

    local.unshift(newItem);
    await writeLocalGallery(local);

    return NextResponse.json(newItem);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
