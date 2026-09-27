import { NextResponse } from "next/server";
import { readFile, writeFile } from "fs/promises";
import path from "path";

const routinesFilePath = path.join(process.cwd(), "src", "data", "routines.json");

async function getRoutinesData() {
  try {
    const data = await readFile(routinesFilePath, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    return { calendarYear: "2025", routineFiles: [], weeklyRoutines: {} };
  }
}

async function saveRoutinesData(data: any) {
  await writeFile(routinesFilePath, JSON.stringify(data, null, 2), "utf-8");
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const cls = searchParams.get("class");
    const data = await getRoutinesData();

    if (cls && data.weeklyRoutines && data.weeklyRoutines[cls]) {
      return NextResponse.json({
        success: true,
        class: cls,
        routine: data.weeklyRoutines[cls],
        files: data.routineFiles.filter((f: any) => f.class === "all" || f.class === cls),
      });
    }

    return NextResponse.json({ success: true, ...data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = await getRoutinesData();

    if (body.action === "uploadFile") {
      const newFile = {
        id: body.id || `rf-${Date.now()}`,
        title: body.title,
        titleEn: body.titleEn || body.title,
        class: body.class || "all",
        fileUrl: body.fileUrl,
        year: body.year || "2026",
        uploadDate: new Date().toISOString().split("T")[0],
      };
      data.routineFiles = [newFile, ...(data.routineFiles || [])];
      await saveRoutinesData(data);
      return NextResponse.json({ success: true, file: newFile, routineFiles: data.routineFiles });
    }

    if (body.action === "editFile") {
      const index = (data.routineFiles || []).findIndex((f: any) => f.id === body.id);
      if (index !== -1) {
        data.routineFiles[index] = {
          ...data.routineFiles[index],
          title: body.title,
          titleEn: body.titleEn || body.title,
          class: body.class || data.routineFiles[index].class,
          year: body.year || data.routineFiles[index].year,
          fileUrl: body.fileUrl || data.routineFiles[index].fileUrl,
        };
        await saveRoutinesData(data);
        return NextResponse.json({ success: true, file: data.routineFiles[index], routineFiles: data.routineFiles });
      }
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    if (body.action === "updateWeekly") {
      const cls = body.class;
      if (!cls || !body.routine) {
        return NextResponse.json({ error: "Missing class or routine" }, { status: 400 });
      }
      if (!data.weeklyRoutines) data.weeklyRoutines = {};
      data.weeklyRoutines[cls] = body.routine;
      await saveRoutinesData(data);
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

    const data = await getRoutinesData();
    data.routineFiles = (data.routineFiles || []).filter((f: any) => f.id !== id);
    await saveRoutinesData(data);

    return NextResponse.json({ success: true, routineFiles: data.routineFiles });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
