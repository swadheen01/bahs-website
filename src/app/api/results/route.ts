import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { readFile, writeFile } from "fs/promises";
import path from "path";
import { supabase } from "@/lib/supabase";

const resultsFilePath = path.join(process.cwd(), "src", "data", "results.json");

async function getResultsFromFile(): Promise<any[]> {
  try {
    const data = await readFile(resultsFilePath, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

async function saveResultsToFile(results: any[]) {
  try {
    await writeFile(resultsFilePath, JSON.stringify(results, null, 2), "utf-8");
  } catch (e) {
    // Ignore read-only filesystem on Vercel
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const cls = searchParams.get("class");
    const roll = searchParams.get("roll");
    const exam = searchParams.get("exam");
    const year = searchParams.get("year");

    const localResults = await getResultsFromFile();

    // Query Supabase for results stored with type='result'
    let dbResults: any[] = [];
    try {
      const { data: dbData } = await supabase
        .from("notices")
        .select("*")
        .eq("type", "result")
        .order("id", { ascending: false });

      if (dbData && dbData.length > 0) {
        dbResults = dbData
          .map((item: any) => {
            try {
              const parsed = JSON.parse(item.added_by || "{}");
              return { id: item.id, ...parsed };
            } catch (e) {
              return null;
            }
          })
          .filter(Boolean);
      }
    } catch (e) {}

    // Merge DB results with local results (avoid duplicate IDs)
    const dbIds = new Set(dbResults.map((r) => String(r.id)));
    let results = [
      ...dbResults,
      ...localResults.filter((r) => !dbIds.has(String(r.id))),
    ];

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

    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const existing = await getResultsFromFile();

    if (Array.isArray(body)) {
      // Bulk insert
      const newItems: any[] = [];
      const dbInserts: any[] = [];

      for (let i = 0; i < body.length; i++) {
        const item = body[i];
        const numId = (Date.now() + i) % 2147483647;
        const resultItem = {
          id: item.id || `res-${numId}`,
          ...item,
        };
        newItems.push(resultItem);
        dbInserts.push({
          id: numId,
          title: `${item.studentName || ""} | Roll:${item.roll || ""} | Class:${item.class || ""}`,
          type: "result",
          date: String(item.year || "2026"),
          date_iso: item.exam || "",
          added_by: JSON.stringify(resultItem),
          is_new: false,
        });
      }

      try {
        await supabase.from("notices").insert(dbInserts);
      } catch (dbErr) {
        console.error("Supabase bulk results insert error:", dbErr);
      }

      const merged = [...existing, ...newItems];
      await saveResultsToFile(merged);
      try { revalidatePath("/", "layout"); } catch(e) {} return NextResponse.json({ success: true, count: newItems.length, results: merged });
    } else {
      // Single insert
      const numId = Date.now() % 2147483647;
      const newItem = {
        id: body.id || `res-${numId}`,
        ...body,
      };

      try {
        await supabase.from("notices").insert({
          id: numId,
          title: `${body.studentName || ""} | Roll:${body.roll || ""} | Class:${body.class || ""}`,
          type: "result",
          date: String(body.year || "2026"),
          date_iso: body.exam || "",
          added_by: JSON.stringify(newItem),
          is_new: false,
        });
      } catch (dbErr) {
        console.error("Supabase single result insert error:", dbErr);
      }

      const merged = [newItem, ...existing];
      await saveResultsToFile(merged);
      try { revalidatePath("/", "layout"); } catch(e) {} return NextResponse.json({ success: true, result: newItem });
    }
  } catch (error: any) {
    try { revalidatePath("/", "layout"); } catch(e) {} return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const id = body.id;
    if (!id) {
      try { revalidatePath("/", "layout"); } catch(e) {} return NextResponse.json({ error: "Missing result id" }, { status: 400 });
    }

    // Update in Supabase notices table where type='result'
    try {
      const cleanId = String(id).replace("res-", "");
      const numId = Number(cleanId);
      if (!isNaN(numId)) {
        await supabase
          .from("notices")
          .update({
            title: `${body.studentName || ""} | Roll:${body.roll || ""} | Class:${body.class || ""}`,
            date: String(body.year || "2026"),
            date_iso: body.exam || "",
            added_by: JSON.stringify(body),
          })
          .eq("id", numId)
          .eq("type", "result");
      }
    } catch (e) {}

    const existing = await getResultsFromFile();
    const index = existing.findIndex((r) => String(r.id) === String(id));
    if (index !== -1) {
      existing[index] = { ...existing[index], ...body };
      await saveResultsToFile(existing);
      try { revalidatePath("/", "layout"); } catch(e) {} return NextResponse.json({ success: true, result: existing[index] });
    }

    try { revalidatePath("/", "layout"); } catch(e) {} return NextResponse.json({ success: true, result: body });
  } catch (error: any) {
    try { revalidatePath("/", "layout"); } catch(e) {} return NextResponse.json({ error: error.message }, { status: 500 });
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
      try { revalidatePath("/", "layout"); } catch(e) {} return NextResponse.json({ error: "Missing result id" }, { status: 400 });
    }

    // Delete from Supabase notices table where type='result'
    try {
      const cleanId = String(id).replace("res-", "");
      const numId = Number(cleanId);
      if (!isNaN(numId)) {
        await supabase.from("notices").delete().eq("id", numId).eq("type", "result");
      }
    } catch (e) {}

    const existing = await getResultsFromFile();
    const filtered = existing.filter((r) => String(r.id) !== String(id));
    await saveResultsToFile(filtered);

    try { revalidatePath("/", "layout"); } catch(e) {} return NextResponse.json({ success: true, remaining: filtered.length });
  } catch (error: any) {
    try { revalidatePath("/", "layout"); } catch(e) {} return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
