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
      date: item.created_at || "২০২৫",
    }));
    await writeFile(jsonPath, JSON.stringify(formatted, null, 2), "utf-8");
  } catch (e) {
    console.error("Local gallery write error:", e);
  }
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("gallery")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && Array.isArray(data) && data.length > 0) {
      return NextResponse.json(data);
    }
  } catch (e) {}

  const local = await readLocalGallery();
  return NextResponse.json(local);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const local = await readLocalGallery();

    const newItem = {
      id: Date.now(),
      title: body.title,
      image: body.image,
      created_at: new Date().toISOString(),
    };

    try {
      const { data, error } = await supabase.from("gallery").insert([body]).select();
      if (!error && data && data.length > 0) {
        newItem.id = data[0].id;
      }
    } catch (e) {}

    local.unshift(newItem);
    await writeLocalGallery(local);

    return NextResponse.json(newItem);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
