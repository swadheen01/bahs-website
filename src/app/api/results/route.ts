import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { readFile, writeFile } from "fs/promises";
import path from "path";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const resultsFilePath = path.join(process.cwd(), "src", "data", "results.json");
const PUBLIC_CACHE_HEADER = { "Cache-Control": "no-cache, max-age=0, must-revalidate" };

const LEGACY_RESULT_IDS: Record<string, number> = {
  "res-6-1-2026": 1840000001,
  "res-6-2-2026": 1840000002,
  "res-7-1-2026": 1840000003,
  "res-8-1-2026": 1840000004,
  "res-9-1-2026": 1840000005,
  "res-10-1-2026": 1840000006,
  "res-6-1-2025": 1840000007,
};

function resolveResultNumericId(rawId: unknown): number | null {
  const str = String(rawId || "").trim();
  if (!str) return null;
  if (LEGACY_RESULT_IDS[str]) return LEGACY_RESULT_IDS[str];
  const cleaned = str.replace(/^res-/, "");
  const num = Number(cleaned);
  return Number.isInteger(num) && num > 0 && num <= 2147483647 ? num : null;
}

function generateUniqueResultId(existingIds: Set<number>): number {
  let candidate = (Date.now() % 2000000000) + 1000000;
  if (candidate > 2147483647) candidate = (candidate % 2000000000) + 1000000;
  while (existingIds.has(candidate)) {
    candidate = candidate >= 2147483646 ? 1840000100 : candidate + 1;
  }
  existingIds.add(candidate);
  return candidate;
}

function parseResultRow(item: any) {
  let parsed: any = {};
  try {
    if (typeof item.title === "string" && item.title.trim().startsWith("{")) {
      parsed = JSON.parse(item.title);
    } else {
      parsed = JSON.parse(item.added_by || "{}");
    }
  } catch {}
  return {
    ...parsed,
    id: String(item.id),
  };
}

async function getResultsFromFile(): Promise<any[]> {
  try {
    const data = await readFile(resultsFilePath, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function saveResultsToFile(results: any[]) {
  try {
    await writeFile(resultsFilePath, JSON.stringify(results, null, 2), "utf-8");
  } catch {
    // Ignore read-only filesystem on serverless/Cloudflare
  }
}

async function fetchResultsFromSupabase(): Promise<any[]> {
  const { data, error } = await supabase
    .from("notices")
    .select("*")
    .eq("type", "result")
    .order("id", { ascending: false });

  if (error) throw error;
  return (data || []).map(parseResultRow);
}

function revalidateResultsPath() {
  try {
    revalidatePath("/academics/results");
  } catch {}
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const cls = searchParams.get("class");
    const roll = searchParams.get("roll");
    const exam = searchParams.get("exam");
    const year = searchParams.get("year");

    let results: any[] = [];
    try {
      results = await fetchResultsFromSupabase();
    } catch (e) {
      console.error("Supabase results fetch error, falling back to local JSON:", e);
      results = await getResultsFromFile();
    }

    if (cls) {
      results = results.filter((r) => String(r.class) === String(cls));
    }
    if (roll) {
      results = results.filter((r) => String(r.roll).trim() === String(roll).trim());
    }
    if (exam) {
      results = results.filter((r) => r.exam === exam);
    }
    if (year) {
      results = results.filter((r) => String(r.year) === String(year));
    }

    return NextResponse.json({ success: true, results }, { headers: PUBLIC_CACHE_HEADER });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const todayISO = new Date().toISOString().split("T")[0];

    const { data: existingRows, error: listErr } = await supabase
      .from("notices")
      .select("id")
      .eq("type", "result");

    if (listErr) {
      return NextResponse.json({ error: `ডাটাবেজ সংযোগ ব্যর্থ হয়েছে: ${listErr.message}` }, { status: 500 });
    }

    const existingIds = new Set<number>((existingRows || []).map((r: any) => Number(r.id)));

    if (Array.isArray(body)) {
      if (body.length === 0) {
        return NextResponse.json({ error: "কোনো ফলাফল পাওয়া যায়নি" }, { status: 400 });
      }

      const newItems: any[] = [];
      const dbInserts: any[] = [];

      for (const item of body) {
        const numId = generateUniqueResultId(existingIds);
        const resultItem = {
          ...item,
          id: String(numId),
        };
        newItems.push(resultItem);
        dbInserts.push({
          id: numId,
          title: JSON.stringify(resultItem),
          type: "result",
          date: String(item.year || "2026").slice(0, 50),
          date_iso: todayISO,
          added_by: `${item.studentName || ""} | Roll:${item.roll || ""} | Class:${item.class || ""}`.slice(0, 250),
          is_new: false,
        });
      }

      const { error: insertErr } = await supabase.from("notices").insert(dbInserts);
      if (insertErr) {
        return NextResponse.json({ error: `ফলাফল সংরক্ষণ ব্যর্থ হয়েছে: ${insertErr.message}` }, { status: 500 });
      }

      let latestResults: any[] = newItems;
      try {
        latestResults = await fetchResultsFromSupabase();
        await saveResultsToFile(latestResults);
      } catch {}

      revalidateResultsPath();
      return NextResponse.json({ success: true, count: newItems.length, results: latestResults });
    } else {
      const numId = generateUniqueResultId(existingIds);
      const newItem = {
        ...body,
        id: String(numId),
      };

      const { error: insertErr } = await supabase.from("notices").insert({
        id: numId,
        title: JSON.stringify(newItem),
        type: "result",
        date: String(body.year || "2026").slice(0, 50),
        date_iso: todayISO,
        added_by: `${body.studentName || ""} | Roll:${body.roll || ""} | Class:${body.class || ""}`.slice(0, 250),
        is_new: false,
      });

      if (insertErr) {
        return NextResponse.json({ error: `ফলাফল সংরক্ষণ ব্যর্থ হয়েছে: ${insertErr.message}` }, { status: 500 });
      }

      try {
        const latestResults = await fetchResultsFromSupabase();
        await saveResultsToFile(latestResults);
      } catch {}

      revalidateResultsPath();
      return NextResponse.json({ success: true, result: newItem });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const id = body.id;
    if (!id) {
      return NextResponse.json({ error: "Missing result id" }, { status: 400 });
    }

    const numId = resolveResultNumericId(id);
    if (!numId) {
      return NextResponse.json({ error: "Invalid result id" }, { status: 400 });
    }

    const { data: existingRow, error: findErr } = await supabase
      .from("notices")
      .select("*")
      .eq("id", numId)
      .eq("type", "result")
      .maybeSingle();

    if (findErr) {
      return NextResponse.json({ error: `ডাটাবেজ ত্রুটি: ${findErr.message}` }, { status: 500 });
    }
    if (!existingRow) {
      return NextResponse.json({ error: "Result not found" }, { status: 404 });
    }

    const prevParsed = parseResultRow(existingRow);
    const mergedResult = {
      ...prevParsed,
      ...body,
      id: String(numId),
    };
    const todayISO = new Date().toISOString().split("T")[0];

    const { error: updateErr } = await supabase
      .from("notices")
      .update({
        title: JSON.stringify(mergedResult),
        date: String(mergedResult.year || "2026").slice(0, 50),
        date_iso: todayISO,
        added_by: `${mergedResult.studentName || ""} | Roll:${mergedResult.roll || ""} | Class:${mergedResult.class || ""}`.slice(0, 250),
      })
      .eq("id", numId)
      .eq("type", "result");

    if (updateErr) {
      return NextResponse.json({ error: `ফলাফল আপডেট ব্যর্থ হয়েছে: ${updateErr.message}` }, { status: 500 });
    }

    try {
      const latestResults = await fetchResultsFromSupabase();
      await saveResultsToFile(latestResults);
    } catch {}

    revalidateResultsPath();
    return NextResponse.json({ success: true, result: mergedResult });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    let id = searchParams.get("id");

    if (!id) {
      const body = await req.json().catch(() => ({}));
      id = body.id;
    }

    if (!id) {
      return NextResponse.json({ error: "Missing result id" }, { status: 400 });
    }

    const numId = resolveResultNumericId(id);
    if (!numId) {
      return NextResponse.json({ error: "Invalid result id" }, { status: 400 });
    }

    const { error: deleteErr } = await supabase
      .from("notices")
      .delete()
      .eq("id", numId)
      .eq("type", "result");

    if (deleteErr) {
      return NextResponse.json({ error: `মুছে ফেলা সম্ভব হয়নি: ${deleteErr.message}` }, { status: 500 });
    }

    let latestResults: any[] = [];
    try {
      latestResults = await fetchResultsFromSupabase();
      await saveResultsToFile(latestResults);
    } catch {}

    revalidateResultsPath();
    return NextResponse.json({ success: true, remaining: latestResults.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
