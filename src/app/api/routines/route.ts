import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { readFile, writeFile } from "fs/promises";
import path from "path";
import { supabase } from "@/lib/supabase";

const routinesFilePath = path.join(process.cwd(), "src", "data", "routines.json");

async function getRoutinesData() {
  try {
    const data = await readFile(routinesFilePath, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    return { calendarYear: "2026", routineFiles: [], weeklyRoutines: {} };
  }
}

async function saveRoutinesData(data: any) {
  try {
    await writeFile(routinesFilePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    // Ignore read-only filesystem on Vercel
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const cls = searchParams.get("class");
    const localData = await getRoutinesData();

    // Query Supabase for routine files stored in notices table (type = 'routine')
    let dbFiles: any[] = [];
    try {
      const { data: noticesData } = await supabase
        .from("notices")
        .select("*")
        .eq("type", "routine")
        .order("id", { ascending: false });

      if (noticesData && noticesData.length > 0) {
        dbFiles = noticesData.map((r: any) => {
          const matchClass = r.added_by?.match(/class:([^|]+)/);
          const matchYear = r.added_by?.match(/year:([^|]+)/);
          return {
            id: String(r.id),
            title: r.title,
            titleEn: r.title,
            class: matchClass ? matchClass[1] : "all",
            year: matchYear ? matchYear[1] : "2026",
            fileUrl: r.file_url,
            uploadDate: r.date_iso,
          };
        });
      }
    } catch (e) {
      console.error("Supabase routine fetch error:", e);
    }

    // Merge: DB files first, then any non-duplicate local routineFiles
    const dbUrls = new Set(dbFiles.map((f) => f.fileUrl));
    const mergedFiles = [
      ...dbFiles,
      ...(localData.routineFiles || []).filter((f: any) => !dbUrls.has(f.fileUrl)),
    ];

    const resultData = {
      ...localData,
      calendarYear: localData.calendarYear || "2026",
      routineFiles: mergedFiles,
    };

    if (cls && resultData.weeklyRoutines && resultData.weeklyRoutines[cls]) {
      return NextResponse.json({
        success: true,
        class: cls,
        routine: resultData.weeklyRoutines[cls],
        files: mergedFiles.filter((f: any) => f.class === "all" || f.class === cls),
      });
    }

    return NextResponse.json({ success: true, ...resultData });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = await getRoutinesData();

    if (body.action === "uploadFile") {
      const numericId = Date.now() % 2147483647;
      const newFile = {
        id: body.id ? String(body.id) : `rf-${numericId}`,
        title: body.title,
        titleEn: body.titleEn || body.title,
        class: body.class || "all",
        fileUrl: body.fileUrl,
        year: body.year || "2026",
        uploadDate: new Date().toISOString().split("T")[0],
      };

      // 1. Insert into Supabase table notices (type='routine')
      try {
        await supabase.from("notices").insert({
          id: numericId,
          title: newFile.title,
          date: new Date().toLocaleDateString("bn-BD"),
          date_iso: newFile.uploadDate,
          type: "routine",
          file_url: newFile.fileUrl,
          added_by: `class:${newFile.class}|year:${newFile.year}`,
          is_new: true,
        });
      } catch (dbErr) {
        console.error("Supabase routine insert error:", dbErr);
      }

      // 2. Also persist to local file if writable
      data.routineFiles = [newFile, ...(data.routineFiles || [])];
      await saveRoutinesData(data);

      try { revalidatePath("/", "layout"); } catch(e) {} return NextResponse.json({ success: true, file: newFile, routineFiles: data.routineFiles });
    }

    if (body.action === "editFile") {
      const cleanId = String(body.id).replace("rf-", "");
      if (!isNaN(Number(cleanId))) {
        try {
          await supabase
            .from("notices")
            .update({
              title: body.title,
              file_url: body.fileUrl,
              added_by: `class:${body.class || "all"}|year:${body.year || "2026"}`,
            })
            .eq("id", Number(cleanId));
        } catch (e) {}
      }

      const index = (data.routineFiles || []).findIndex((f: any) => String(f.id) === String(body.id));
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
      }

      try { revalidatePath("/", "layout"); } catch(e) {} return NextResponse.json({ success: true, file: body });
    }

    if (body.action === "updateWeekly") {
      const cls = body.class;
      if (!cls || !body.routine) {
        try { revalidatePath("/", "layout"); } catch(e) {} return NextResponse.json({ error: "Missing class or routine" }, { status: 400 });
      }
      if (!data.weeklyRoutines) data.weeklyRoutines = {};
      data.weeklyRoutines[cls] = body.routine;
      await saveRoutinesData(data);
      try { revalidatePath("/", "layout"); } catch(e) {} return NextResponse.json({ success: true, class: cls, routine: body.routine });
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
      try { revalidatePath("/", "layout"); } catch(e) {} return NextResponse.json({ error: "Missing file id" }, { status: 400 });
    }

    // 1. Delete from Supabase notices table where type='routine'
    try {
      const cleanId = String(id).replace("rf-", "");
      if (!isNaN(Number(cleanId))) {
        await supabase.from("notices").delete().eq("id", Number(cleanId)).eq("type", "routine");
      }
      // Also delete by matching file_url
      await supabase.from("notices").delete().eq("file_url", id).eq("type", "routine");
    } catch (e) {
      console.error("Supabase routine delete error:", e);
    }

    // 2. Delete from local routines.json
    const data = await getRoutinesData();
    data.routineFiles = (data.routineFiles || []).filter((f: any) => String(f.id) !== String(id));
    await saveRoutinesData(data);

    try { revalidatePath("/", "layout"); } catch(e) {} return NextResponse.json({ success: true, routineFiles: data.routineFiles });
  } catch (error: any) {
    try { revalidatePath("/", "layout"); } catch(e) {} return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
