import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { readFile, writeFile } from "fs/promises";
import path from "path";

const COUNTER_ID = 88888888;
const localFilePath = path.join(process.cwd(), "src", "data", "testimonial-counter.json");

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
    // Try Supabase first
    const { data } = await supabase
      .from("notices")
      .select("added_by")
      .eq("id", COUNTER_ID)
      .eq("type", "testimonial_counter")
      .single();

    if (data?.added_by) {
      try {
        const parsed = JSON.parse(data.added_by);
        const count = Number(parsed.count) || 1;
        return NextResponse.json({ count });
      } catch {}
    }

    const localCount = await getLocalCount();
    return NextResponse.json({ count: localCount });
  } catch (err: any) {
    const localCount = await getLocalCount();
    return NextResponse.json({ count: localCount });
  }
}

export async function POST() {
  try {
    let current = 1;

    // Check existing count in DB
    const { data } = await supabase
      .from("notices")
      .select("added_by")
      .eq("id", COUNTER_ID)
      .eq("type", "testimonial_counter")
      .single();

    if (data?.added_by) {
      try {
        const parsed = JSON.parse(data.added_by);
        current = (Number(parsed.count) || 1) + 1;
      } catch {
        current = (await getLocalCount()) + 1;
      }

      await supabase
        .from("notices")
        .update({
          added_by: JSON.stringify({ count: current }),
          date_iso: new Date().toISOString().split("T")[0],
        })
        .eq("id", COUNTER_ID)
        .eq("type", "testimonial_counter");
    } else {
      // First time initialization
      const local = await getLocalCount();
      current = local >= 1 ? local + 1 : 1;

      await supabase.from("notices").insert({
        id: COUNTER_ID,
        title: "Testimonial Serial Counter",
        date: new Date().toLocaleDateString("en-CA"),
        date_iso: new Date().toISOString().split("T")[0],
        type: "testimonial_counter",
        added_by: JSON.stringify({ count: current }),
        is_new: false,
      });
    }

    await saveLocalCount(current);
    return NextResponse.json({ success: true, count: current });
  } catch (err: any) {
    // Fallback to local
    const count = (await getLocalCount()) + 1;
    await saveLocalCount(count);
    return NextResponse.json({ success: true, count });
  }
}

