import { revalidatePath } from "@/lib/legacy-cache";
import { NextResponse } from "next/server";
import { readFile, writeFile } from "fs/promises";
import path from "path";
import { supabase } from "@/lib/supabase";

const holidaysFilePath = path.join(process.cwd(), "src", "data", "holidays.json");

async function getHolidaysData() {
  try {
    const data = await readFile(holidaysFilePath, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    return { academicYear: "2026", holidays: [], calendarPdfUrl: "", calendarPdfTitle: "" };
  }
}

async function saveHolidaysData(data: any) {
  try {
    await writeFile(holidaysFilePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    // Ignore read-only filesystem on Vercel
  }
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
    } catch (e) {}

    return NextResponse.json({ success: true, ...data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = await getHolidaysData();

    if (body.action === "uploadCalendar") {
      if (body.calendarPdfUrl) data.calendarPdfUrl = body.calendarPdfUrl;
      if (body.calendarPdfTitle) data.calendarPdfTitle = body.calendarPdfTitle;
      if (body.academicYear) data.academicYear = body.academicYear;

      // Sync calendar PDF to Supabase notices where type='calendar'
      try {
        const { data: existingCal } = await supabase
          .from("notices")
          .select("id")
          .eq("type", "calendar")
          .limit(1);

        if (existingCal && existingCal.length > 0) {
          await supabase
            .from("notices")
            .update({
              title: body.calendarPdfTitle || "শিক্ষাবর্ষ ক্যালেন্ডার",
              file_url: body.calendarPdfUrl,
              date: body.academicYear || "২০২৬",
              date_iso: new Date().toISOString(),
            })
            .eq("id", existingCal[0].id);
        } else {
          await supabase.from("notices").insert({
            id: Date.now() % 2147483647,
            title: body.calendarPdfTitle || "শিক্ষাবর্ষ ক্যালেন্ডার",
            file_url: body.calendarPdfUrl,
            type: "calendar",
            date: body.academicYear || "২০২৬",
            date_iso: new Date().toISOString(),
            is_new: false,
          });
        }
      } catch (e) {
        console.error("Supabase calendar sync error:", e);
      }

      await saveHolidaysData(data);
      try { revalidatePath("/", "layout"); } catch(e) {} return NextResponse.json({ success: true, data });
    }

    if (body.action === "addHoliday") {
      const newHoliday = {
        id: body.id || `h-${Date.now()}`,
        title: body.title,
        titleEn: body.titleEn || body.title,
        startDate: body.startDate,
        endDate: body.endDate || body.startDate,
        totalDays: body.totalDays || "১ দিন",
        type: body.type || "সরকারি ছুটি",
        description: body.description || "",
      };
      data.holidays = [newHoliday, ...(data.holidays || [])];
      await saveHolidaysData(data);
      try { revalidatePath("/", "layout"); } catch(e) {} return NextResponse.json({ success: true, holiday: newHoliday, holidays: data.holidays });
    }

    if (body.action === "editHoliday" || body.action === "updateHoliday") {
      const index = (data.holidays || []).findIndex((h: any) => h.id === body.id);
      if (index !== -1) {
        data.holidays[index] = {
          ...data.holidays[index],
          title: body.title,
          titleEn: body.titleEn || body.title,
          startDate: body.startDate,
          endDate: body.endDate || body.startDate,
          totalDays: body.totalDays || data.holidays[index].totalDays,
          type: body.type || data.holidays[index].type,
          description: body.description !== undefined ? body.description : data.holidays[index].description,
        };
        await saveHolidaysData(data);
        try { revalidatePath("/", "layout"); } catch(e) {} return NextResponse.json({ success: true, holiday: data.holidays[index], holidays: data.holidays });
      }
      try { revalidatePath("/", "layout"); } catch(e) {} return NextResponse.json({ error: "Holiday not found" }, { status: 404 });
    }

    try { revalidatePath("/", "layout"); } catch(e) {} return NextResponse.json({ error: "Invalid action" }, { status: 400 });
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
      try { revalidatePath("/", "layout"); } catch(e) {} return NextResponse.json({ error: "Missing holiday id" }, { status: 400 });
    }

    const data = await getHolidaysData();
    data.holidays = (data.holidays || []).filter((h: any) => h.id !== id);
    await saveHolidaysData(data);

    try { revalidatePath("/", "layout"); } catch(e) {} return NextResponse.json({ success: true, holidays: data.holidays });
  } catch (error: any) {
    try { revalidatePath("/", "layout"); } catch(e) {} return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
