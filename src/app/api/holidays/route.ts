import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { readFile, writeFile } from "fs/promises";
import path from "path";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const holidaysFilePath = path.join(process.cwd(), "src", "data", "holidays.json");

const LEGACY_HOLIDAY_IDS: Record<string, number> = {
  "h-1": 1810000001,
  "h-2": 1810000002,
  "h-3": 1810000003,
  "h-4": 1810000004,
  "h-5": 1810000005,
  "h-6": 1810000006,
  "h-7": 1810000007,
  "h-8": 1810000008,
  "h-9": 1810000009,
  "h-10": 1810000010,
  "h-11": 1810000011,
  "h-12": 1810000012,
  "h-13": 1810000013,
};

function resolveHolidayNumericId(rawId: unknown): number | null {
  const str = String(rawId || "").trim();
  if (!str) return null;
  if (LEGACY_HOLIDAY_IDS[str]) return LEGACY_HOLIDAY_IDS[str];
  const cleaned = str.replace(/^h-/, "");
  const num = Number(cleaned);
  return Number.isInteger(num) && num > 0 && num <= 2147483647 ? num : null;
}

function parseHolidayRow(row: any) {
  let payload: any = {};
  try {
    if (typeof row.title === "string" && row.title.trim().startsWith("{")) {
      payload = JSON.parse(row.title);
    }
  } catch {}

  const title = String(payload.title || row.title || "").trim();
  return {
    sortOrder: typeof payload.sortOrder === "number" ? payload.sortOrder : Number(row.id) || 0,
    holiday: {
      id: String(row.id),
      title,
      titleEn: String(payload.titleEn || title).trim(),
      startDate: String(payload.startDate || "").trim(),
      endDate: String(payload.endDate || payload.startDate || "").trim(),
      totalDays: String(payload.totalDays || "১ দিন").trim(),
      type: String(payload.type || "সরকারি ছুটি").trim(),
      description: String(payload.description || "").trim(),
    },
  };
}

async function getHolidaysData() {
  try {
    const data = await readFile(holidaysFilePath, "utf-8");
    return JSON.parse(data);
  } catch {
    return { academicYear: "2026", holidays: [], calendarPdfUrl: "", calendarPdfTitle: "" };
  }
}

async function saveHolidaysData(data: any) {
  try {
    await writeFile(holidaysFilePath, JSON.stringify(data, null, 2), "utf-8");
  } catch {
    // Ignore read-only filesystem in production (Cloudflare / serverless)
  }
}

async function fetchHolidaysFromSupabase() {
  const { data, error } = await supabase
    .from("notices")
    .select("id, title, date, date_iso, type, file_url, added_by")
    .eq("type", "holiday")
    .order("id", { ascending: true });

  if (error) throw error;

  return (data || [])
    .map(parseHolidayRow)
    .sort((a, b) => a.sortOrder - b.sortOrder || Number(a.holiday.id) - Number(b.holiday.id))
    .map((entry) => entry.holiday);
}

function generateUniqueHolidayId(existingIds: Set<number>): number {
  let candidate = (Date.now() % 2000000000) + 1000000;
  if (candidate > 2147483647) candidate = (candidate % 2000000000) + 1000000;
  while (existingIds.has(candidate)) {
    candidate = candidate >= 2147483646 ? 1810000100 : candidate + 1;
  }
  return candidate;
}

function revalidateHolidayPaths() {
  try {
    revalidatePath("/academics/holidays");
    revalidatePath("/academics/calendar");
  } catch {}
}

export async function GET() {
  try {
    const data = await getHolidaysData();

    // Check Supabase for calendar PDF
    try {
      const { data: calData } = await supabase
        .from("notices")
        .select("*")
        .eq("type", "calendar")
        .order("id", { ascending: false })
        .limit(1);

      if (calData && calData.length > 0) {
        data.calendarPdfUrl = calData[0].file_url || data.calendarPdfUrl;
        data.calendarPdfTitle = calData[0].title || data.calendarPdfTitle;
        if (calData[0].date) data.academicYear = calData[0].date;
      }
    } catch {}

    // Fetch persistent holiday items from Supabase
    try {
      data.holidays = await fetchHolidaysFromSupabase();
    } catch (e) {
      console.error("Supabase holiday fetch error, falling back to local JSON:", e);
    }

    return NextResponse.json(
      { success: true, ...data },
      { headers: { "Cache-Control": "no-cache, max-age=0, must-revalidate" } }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = await getHolidaysData();
    const todayISO = new Date().toISOString().split("T")[0];

    if (body.action === "uploadCalendar") {
      if (body.calendarPdfUrl) data.calendarPdfUrl = body.calendarPdfUrl;
      if (body.calendarPdfTitle) data.calendarPdfTitle = body.calendarPdfTitle;
      if (body.academicYear) data.academicYear = body.academicYear;

      // Sync calendar PDF to Supabase notices where type='calendar'
      const { data: existingCal, error: calFindError } = await supabase
        .from("notices")
        .select("id")
        .eq("type", "calendar")
        .limit(1);

      if (calFindError) {
        return NextResponse.json(
          { error: `ডাটাবেজ ত্রুটি: ${calFindError.message}` },
          { status: 500 }
        );
      }

      if (existingCal && existingCal.length > 0) {
        const { error: updateErr } = await supabase
          .from("notices")
          .update({
            title: body.calendarPdfTitle || "শিক্ষাবর্ষ ক্যালেন্ডার",
            file_url: body.calendarPdfUrl,
            date: String(body.academicYear || "2026").slice(0, 50),
            date_iso: todayISO,
          })
          .eq("id", existingCal[0].id);

        if (updateErr) {
          return NextResponse.json(
            { error: `ক্যালেন্ডার আপডেট ব্যর্থ হয়েছে: ${updateErr.message}` },
            { status: 500 }
          );
        }
      } else {
        const { error: insertErr } = await supabase.from("notices").insert({
          id: (Date.now() % 2000000000) + 1000000,
          title: body.calendarPdfTitle || "শিক্ষাবর্ষ ক্যালেন্ডার",
          file_url: body.calendarPdfUrl,
          type: "calendar",
          date: String(body.academicYear || "2026").slice(0, 50),
          date_iso: todayISO,
          is_new: false,
        });

        if (insertErr) {
          return NextResponse.json(
            { error: `ক্যালেন্ডার সংরক্ষণ ব্যর্থ হয়েছে: ${insertErr.message}` },
            { status: 500 }
          );
        }
      }

      await saveHolidaysData(data);
      revalidateHolidayPaths();
      return NextResponse.json({ success: true, data });
    }

    if (body.action === "addHoliday") {
      const title = String(body.title || "").trim();
      const startDate = String(body.startDate || "").trim();
      if (!title || !startDate) {
        return NextResponse.json(
          { error: "ছুটির নাম এবং শুরুর তারিখ আবশ্যক" },
          { status: 400 }
        );
      }

      const { data: existingRows, error: listErr } = await supabase
        .from("notices")
        .select("id")
        .eq("type", "holiday");

      if (listErr) {
        return NextResponse.json(
          { error: `ডাটাবেজ সংযোগ ব্যর্থ হয়েছে: ${listErr.message}` },
          { status: 500 }
        );
      }

      const existingIds = new Set<number>((existingRows || []).map((r: any) => Number(r.id)));
      const newId = generateUniqueHolidayId(existingIds);

      const holidayPayload = {
        title,
        titleEn: String(body.titleEn || title).trim(),
        startDate,
        endDate: String(body.endDate || startDate).trim(),
        totalDays: String(body.totalDays || "১ দিন").trim(),
        type: String(body.type || "সরকারি ছুটি").trim(),
        description: String(body.description || "").trim(),
        sortOrder: -(Date.now()), // Newest additions appear first
      };

      const { data: inserted, error: insertErr } = await supabase
        .from("notices")
        .insert({
          id: newId,
          title: JSON.stringify(holidayPayload),
          date: String(data.academicYear || "2026").slice(0, 50),
          date_iso: todayISO,
          type: "holiday",
          file_url: null,
          is_new: false,
          added_by: "holiday",
        })
        .select()
        .single();

      if (insertErr) {
        return NextResponse.json(
          { error: `ছুটি সংরক্ষণ ব্যর্থ হয়েছে: ${insertErr.message}` },
          { status: 500 }
        );
      }

      const newHoliday = parseHolidayRow(inserted).holiday;
      let latestHolidays: any[] = [newHoliday];
      try {
        latestHolidays = await fetchHolidaysFromSupabase();
        data.holidays = latestHolidays;
        await saveHolidaysData(data);
      } catch {}

      revalidateHolidayPaths();
      return NextResponse.json({ success: true, holiday: newHoliday, holidays: latestHolidays });
    }

    if (body.action === "editHoliday" || body.action === "updateHoliday") {
      const numericId = resolveHolidayNumericId(body.id);
      if (!numericId) {
        return NextResponse.json({ error: "Holiday not found" }, { status: 404 });
      }

      const { data: existingRow, error: findErr } = await supabase
        .from("notices")
        .select("*")
        .eq("id", numericId)
        .eq("type", "holiday")
        .maybeSingle();

      if (findErr) {
        return NextResponse.json({ error: `ডাটাবেজ ত্রুটি: ${findErr.message}` }, { status: 500 });
      }
      if (!existingRow) {
        return NextResponse.json({ error: "Holiday not found" }, { status: 404 });
      }

      const prev = parseHolidayRow(existingRow);
      const title = String(body.title ?? prev.holiday.title).trim();
      const startDate = String(body.startDate ?? prev.holiday.startDate).trim();
      if (!title || !startDate) {
        return NextResponse.json(
          { error: "ছুটির নাম এবং শুরুর তারিখ আবশ্যক" },
          { status: 400 }
        );
      }

      const updatedPayload = {
        title,
        titleEn: String(body.titleEn ?? title).trim(),
        startDate,
        endDate: String(body.endDate ?? startDate).trim(),
        totalDays: String(body.totalDays ?? prev.holiday.totalDays).trim(),
        type: String(body.type ?? prev.holiday.type).trim(),
        description:
          body.description !== undefined ? String(body.description).trim() : prev.holiday.description,
        sortOrder: prev.sortOrder,
      };

      const { data: updatedRow, error: updateErr } = await supabase
        .from("notices")
        .update({
          title: JSON.stringify(updatedPayload),
          date: String(data.academicYear || "2026").slice(0, 50),
          date_iso: todayISO,
        })
        .eq("id", numericId)
        .eq("type", "holiday")
        .select()
        .single();

      if (updateErr) {
        return NextResponse.json(
          { error: `ছুটি আপডেট ব্যর্থ হয়েছে: ${updateErr.message}` },
          { status: 500 }
        );
      }

      const updatedHoliday = parseHolidayRow(updatedRow).holiday;
      let latestHolidays: any[] = [];
      try {
        latestHolidays = await fetchHolidaysFromSupabase();
        data.holidays = latestHolidays;
        await saveHolidaysData(data);
      } catch {}

      revalidateHolidayPaths();
      return NextResponse.json({ success: true, holiday: updatedHoliday, holidays: latestHolidays });
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
      return NextResponse.json({ error: "Missing holiday id" }, { status: 400 });
    }

    const numericId = resolveHolidayNumericId(id);
    if (!numericId) {
      return NextResponse.json({ error: "Invalid holiday id" }, { status: 400 });
    }

    const { error: deleteErr } = await supabase
      .from("notices")
      .delete()
      .eq("id", numericId)
      .eq("type", "holiday");

    if (deleteErr) {
      return NextResponse.json(
        { error: `মুছে ফেলা সম্ভব হয়নি: ${deleteErr.message}` },
        { status: 500 }
      );
    }

    let latestHolidays: any[] = [];
    try {
      latestHolidays = await fetchHolidaysFromSupabase();
      const data = await getHolidaysData();
      data.holidays = latestHolidays;
      await saveHolidaysData(data);
    } catch {}

    revalidateHolidayPaths();
    return NextResponse.json({ success: true, holidays: latestHolidays });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
