import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { readFile, writeFile } from "fs/promises";
import path from "path";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const routinesFilePath = path.join(process.cwd(), "src", "data", "routines.json");
const WEEKLY_ROUTINE_ID = 1830000001;
const PUBLIC_CACHE_HEADER = { "Cache-Control": "no-cache, max-age=0, must-revalidate" };

function resolveRoutineNumericId(rawId: unknown): number | null {
  const cleaned = String(rawId || "").trim().replace(/^rf-/, "");
  const num = Number(cleaned);
  return Number.isInteger(num) && num > 0 && num <= 2147483647 ? num : null;
}

function generateUniqueRoutineId(existingIds: Set<number>): number {
  let candidate = (Date.now() % 2000000000) + 1000000;
  if (candidate > 2147483647) candidate = (candidate % 2000000000) + 1000000;
  while (existingIds.has(candidate)) {
    candidate = candidate >= 2147483646 ? 1830000100 : candidate + 1;
  }
  return candidate;
}

async function getRoutinesData() {
  try {
    const data = await readFile(routinesFilePath, "utf-8");
    return JSON.parse(data);
  } catch {
    return { calendarYear: "2026", routineFiles: [], weeklyRoutines: {} };
  }
}

async function saveRoutinesData(data: any) {
  try {
    await writeFile(routinesFilePath, JSON.stringify(data, null, 2), "utf-8");
  } catch {
    // Ignore read-only filesystem on serverless/Cloudflare
  }
}

async function fetchRoutinesFromSupabase(localData: any) {
  const { data: rows, error } = await supabase
    .from("notices")
    .select("*")
    .in("type", ["routine", "routine_weekly"])
    .order("id", { ascending: false });

  if (error) throw error;

  const routineFiles = (rows || [])
    .filter((r: any) => r.type === "routine")
    .map((r: any) => {
      const matchClass = r.added_by?.match(/class:([^|]+)/);
      const matchYear = r.added_by?.match(/year:([^|]+)/);
      return {
        id: String(r.id),
        title: r.title,
        titleEn: r.title,
        class: matchClass ? matchClass[1] : "all",
        year: matchYear ? matchYear[1] : "2026",
        fileUrl: r.file_url,
        uploadDate: r.date_iso || r.date || "",
      };
    });

  let weeklyRoutines = localData.weeklyRoutines || {};
  const weeklyRow =
    (rows || []).find((r: any) => r.type === "routine_weekly" && Number(r.id) === WEEKLY_ROUTINE_ID) ||
    (rows || []).find((r: any) => r.type === "routine_weekly");

  if (weeklyRow?.file_url) {
    try {
      const parsedWeekly = JSON.parse(weeklyRow.file_url);
      if (parsedWeekly && typeof parsedWeekly === "object") {
        weeklyRoutines = parsedWeekly;
      }
    } catch {}
  }

  return {
    calendarYear: localData.calendarYear || "2026",
    routineFiles,
    weeklyRoutines,
  };
}

function revalidateRoutinePaths(cls?: string) {
  try {
    revalidatePath("/academics/routine");
    if (cls && cls !== "all") {
      revalidatePath(`/students/class-${cls}`);
    }
  } catch {}
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const cls = searchParams.get("class");
    const localData = await getRoutinesData();

    let resultData: any;
    try {
      resultData = await fetchRoutinesFromSupabase(localData);
    } catch (e) {
      console.error("Supabase routine fetch error, falling back to local JSON:", e);
      resultData = {
        ...localData,
        calendarYear: localData.calendarYear || "2026",
        routineFiles: localData.routineFiles || [],
        weeklyRoutines: localData.weeklyRoutines || {},
      };
    }

    if (cls && resultData.weeklyRoutines && resultData.weeklyRoutines[cls]) {
      return NextResponse.json(
        {
          success: true,
          class: cls,
          routine: resultData.weeklyRoutines[cls],
          files: (resultData.routineFiles || []).filter(
            (f: any) => f.class === "all" || String(f.class) === String(cls)
          ),
        },
        { headers: PUBLIC_CACHE_HEADER }
      );
    }

    return NextResponse.json({ success: true, ...resultData }, { headers: PUBLIC_CACHE_HEADER });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const localData = await getRoutinesData();
    const todayISO = new Date().toISOString().split("T")[0];

    if (body.action === "uploadFile") {
      const title = String(body.title || "").trim();
      const fileUrl = String(body.fileUrl || "").trim();
      if (!title || !fileUrl) {
        return NextResponse.json({ error: "শিরোনাম এবং ফাইল আবশ্যক" }, { status: 400 });
      }

      const { data: existingRows, error: listErr } = await supabase
        .from("notices")
        .select("id")
        .eq("type", "routine");

      if (listErr) {
        return NextResponse.json({ error: `ডাটাবেজ সংযোগ ব্যর্থ হয়েছে: ${listErr.message}` }, { status: 500 });
      }

      const existingIds = new Set<number>((existingRows || []).map((r: any) => Number(r.id)));
      const numericId = generateUniqueRoutineId(existingIds);
      const cls = String(body.class || "all").trim();
      const year = String(body.year || "2026").trim();

      const { error: insertErr } = await supabase.from("notices").insert({
        id: numericId,
        title,
        date: todayISO,
        date_iso: todayISO,
        type: "routine",
        file_url: fileUrl,
        added_by: `class:${cls}|year:${year}`,
        is_new: true,
      });

      if (insertErr) {
        return NextResponse.json({ error: `রুটিন সংরক্ষণ ব্যর্থ হয়েছে: ${insertErr.message}` }, { status: 500 });
      }

      const newFile = {
        id: String(numericId),
        title,
        titleEn: body.titleEn || title,
        class: cls,
        fileUrl,
        year,
        uploadDate: todayISO,
      };

      let latestFiles = [newFile];
      try {
        const snapshot = await fetchRoutinesFromSupabase(localData);
        latestFiles = snapshot.routineFiles;
        await saveRoutinesData({ ...localData, ...snapshot });
      } catch {}

      revalidateRoutinePaths(cls);
      return NextResponse.json({ success: true, file: newFile, routineFiles: latestFiles });
    }

    if (body.action === "editFile") {
      const numId = resolveRoutineNumericId(body.id);
      if (!numId) {
        return NextResponse.json({ error: "Invalid file id" }, { status: 400 });
      }

      const { data: existingRow, error: findErr } = await supabase
        .from("notices")
        .select("*")
        .eq("id", numId)
        .eq("type", "routine")
        .maybeSingle();

      if (findErr) {
        return NextResponse.json({ error: `ডাটাবেজ ত্রুটি: ${findErr.message}` }, { status: 500 });
      }
      if (!existingRow) {
        return NextResponse.json({ error: "Routine file not found" }, { status: 404 });
      }

      const matchClass = existingRow.added_by?.match(/class:([^|]+)/);
      const matchYear = existingRow.added_by?.match(/year:([^|]+)/);
      const cls = String(body.class || (matchClass ? matchClass[1] : "all")).trim();
      const year = String(body.year || (matchYear ? matchYear[1] : "2026")).trim();
      const title = String(body.title ?? existingRow.title).trim();
      const fileUrl = body.fileUrl ? String(body.fileUrl).trim() : existingRow.file_url;

      const { error: updateErr } = await supabase
        .from("notices")
        .update({
          title,
          date: todayISO,
          date_iso: todayISO,
          file_url: fileUrl,
          added_by: `class:${cls}|year:${year}`,
        })
        .eq("id", numId)
        .eq("type", "routine");

      if (updateErr) {
        return NextResponse.json({ error: `রুটিন আপডেট ব্যর্থ হয়েছে: ${updateErr.message}` }, { status: 500 });
      }

      try {
        const snapshot = await fetchRoutinesFromSupabase(localData);
        await saveRoutinesData({ ...localData, ...snapshot });
      } catch {}

      revalidateRoutinePaths(cls);
      return NextResponse.json({
        success: true,
        file: { id: String(numId), title, class: cls, year, fileUrl, uploadDate: todayISO },
      });
    }

    if (body.action === "updateWeekly") {
      const cls = String(body.class || "").trim();
      if (!cls || !Array.isArray(body.routine)) {
        return NextResponse.json({ error: "Missing class or routine" }, { status: 400 });
      }

      const { data: existingWeekly, error: findWeeklyErr } = await supabase
        .from("notices")
        .select("id, file_url")
        .eq("type", "routine_weekly")
        .order("id", { ascending: true })
        .limit(1);

      if (findWeeklyErr) {
        return NextResponse.json({ error: `ডাটাবেজ ত্রুটি: ${findWeeklyErr.message}` }, { status: 500 });
      }

      let weeklyRoutines: Record<string, any> = { ...(localData.weeklyRoutines || {}) };
      if (existingWeekly && existingWeekly.length > 0 && existingWeekly[0].file_url) {
        try {
          const parsed = JSON.parse(existingWeekly[0].file_url);
          if (parsed && typeof parsed === "object") {
            weeklyRoutines = { ...weeklyRoutines, ...parsed };
          }
        } catch {}
      }

      weeklyRoutines[cls] = body.routine;
      const serialized = JSON.stringify(weeklyRoutines);

      if (existingWeekly && existingWeekly.length > 0) {
        const { error: updateWeeklyErr } = await supabase
          .from("notices")
          .update({
            file_url: serialized,
            date: todayISO,
            date_iso: todayISO,
          })
          .eq("id", existingWeekly[0].id)
          .eq("type", "routine_weekly");

        if (updateWeeklyErr) {
          return NextResponse.json({ error: `সাপ্তাহিক রুটিন সেভ ব্যর্থ হয়েছে: ${updateWeeklyErr.message}` }, { status: 500 });
        }
      } else {
        const { error: insertWeeklyErr } = await supabase.from("notices").insert({
          id: WEEKLY_ROUTINE_ID,
          title: "Weekly Class Routines",
          date: todayISO,
          date_iso: todayISO,
          type: "routine_weekly",
          file_url: serialized,
          is_new: false,
        });

        if (insertWeeklyErr) {
          return NextResponse.json({ error: `সাপ্তাহিক রুটিন সংরক্ষণ ব্যর্থ হয়েছে: ${insertWeeklyErr.message}` }, { status: 500 });
        }
      }

      localData.weeklyRoutines = weeklyRoutines;
      await saveRoutinesData(localData);

      revalidateRoutinePaths(cls);
      return NextResponse.json({ success: true, class: cls, routine: body.routine });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
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
      return NextResponse.json({ error: "Missing file id" }, { status: 400 });
    }

    const numId = resolveRoutineNumericId(id);
    if (numId) {
      const { error: deleteErr } = await supabase
        .from("notices")
        .delete()
        .eq("id", numId)
        .eq("type", "routine");

      if (deleteErr) {
        return NextResponse.json({ error: `মুছে ফেলা সম্ভব হয়নি: ${deleteErr.message}` }, { status: 500 });
      }
    } else {
      const { error: deleteByUrlErr } = await supabase
        .from("notices")
        .delete()
        .eq("file_url", id)
        .eq("type", "routine");

      if (deleteByUrlErr) {
        return NextResponse.json({ error: `মুছে ফেলা সম্ভব হয়নি: ${deleteByUrlErr.message}` }, { status: 500 });
      }
    }

    const localData = await getRoutinesData();
    let latestFiles: any[] = [];
    try {
      const snapshot = await fetchRoutinesFromSupabase(localData);
      latestFiles = snapshot.routineFiles;
      await saveRoutinesData({ ...localData, ...snapshot });
    } catch {}

    revalidateRoutinePaths();
    return NextResponse.json({ success: true, routineFiles: latestFiles });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
