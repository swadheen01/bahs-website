import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { readFile, writeFile } from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

const COUNTER_ID = 88888888;
const localFilePath = path.join(process.cwd(), "src", "data", "testimonial-counter.json");
const PUBLIC_CACHE_HEADER = { "Cache-Control": "no-cache, max-age=0, must-revalidate" };

async function getLocalCount(): Promise<number> {
  try {
    const raw = await readFile(localFilePath, "utf-8");
    const parsed = JSON.parse(raw);
    return Number(parsed.count) || 1;
  } catch {
    return 1;
  }
}

async function saveLocalCount(count: number) {
  try {
    await writeFile(localFilePath, JSON.stringify({ count }, null, 2), "utf-8");
  } catch {}
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("notices")
      .select("added_by")
      .eq("id", COUNTER_ID)
      .eq("type", "testimonial_counter")
      .maybeSingle();

    if (error && error.code !== "PGRST116") throw error;

    if (data?.added_by) {
      try {
        const parsed = JSON.parse(data.added_by);
        const count = Number(parsed.count) || 1;
        return NextResponse.json({ count }, { headers: PUBLIC_CACHE_HEADER });
      } catch {}
    }

    const localCount = await getLocalCount();
    return NextResponse.json({ count: localCount }, { headers: PUBLIC_CACHE_HEADER });
  } catch (err) {
    console.error("Supabase testimonial-counter GET error:", err);
    const localCount = await getLocalCount();
    return NextResponse.json({ count: localCount }, { headers: PUBLIC_CACHE_HEADER });
  }
}

export async function POST() {
  try {
    let current = 1;
    const todayISO = new Date().toISOString().split("T")[0];

    const { data, error: findErr } = await supabase
      .from("notices")
      .select("added_by")
      .eq("id", COUNTER_ID)
      .eq("type", "testimonial_counter")
      .maybeSingle();

    if (findErr && findErr.code !== "PGRST116") {
      throw findErr;
    }

    if (data?.added_by) {
      try {
        const parsed = JSON.parse(data.added_by);
        current = (Number(parsed.count) || 1) + 1;
      } catch {
        current = (await getLocalCount()) + 1;
      }

      const { error: updateErr } = await supabase
        .from("notices")
        .update({
          added_by: JSON.stringify({ count: current }),
          date_iso: todayISO,
        })
        .eq("id", COUNTER_ID)
        .eq("type", "testimonial_counter");

      if (updateErr) throw updateErr;
    } else {
      const local = await getLocalCount();
      current = local >= 1 ? local + 1 : 1;

      const { error: insertErr } = await supabase.from("notices").insert({
        id: COUNTER_ID,
        title: "Testimonial Serial Counter",
        date: todayISO,
        date_iso: todayISO,
        type: "testimonial_counter",
        added_by: JSON.stringify({ count: current }),
        is_new: false,
      });

      if (insertErr) throw insertErr;
    }

    await saveLocalCount(current);
    return NextResponse.json({ success: true, count: current });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Counter update failed" }, { status: 500 });
  }
}
