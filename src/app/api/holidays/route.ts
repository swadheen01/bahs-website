import { NextResponse } from "next/server";
import { readFile, writeFile } from "fs/promises";
import path from "path";

const holidaysFilePath = path.join(process.cwd(), "src", "data", "holidays.json");

async function getHolidaysData() {
  try {
    const data = await readFile(holidaysFilePath, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    return { academicYear: "2025", holidays: [], calendarPdfUrl: "" };
  }
}

async function saveHolidaysData(data: any) {
  await writeFile(holidaysFilePath, JSON.stringify(data, null, 2), "utf-8");
}

export async function GET() {
  try {
    const data = await getHolidaysData();
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
      await saveHolidaysData(data);
      return NextResponse.json({ success: true, data });
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
      return NextResponse.json({ success: true, holiday: newHoliday, holidays: data.holidays });
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
        return NextResponse.json({ success: true, holiday: data.holidays[index], holidays: data.holidays });
      }
      return NextResponse.json({ error: "Holiday not found" }, { status: 404 });
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

    const data = await getHolidaysData();
    data.holidays = (data.holidays || []).filter((h: any) => h.id !== id);
    await saveHolidaysData(data);

    return NextResponse.json({ success: true, holidays: data.holidays });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
