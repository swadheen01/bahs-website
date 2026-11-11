import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { readFile, writeFile } from "fs/promises";
import path from "path";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const infoPath = path.join(process.cwd(), "src", "data", "school-info.json");
const PUBLIC_CACHE_HEADER = { "Cache-Control": "no-cache, max-age=0, must-revalidate" };

export async function GET() {
  try {
    let data: any = {};
    try {
      const content = await readFile(infoPath, "utf-8");
      data = JSON.parse(content);
    } catch {}

    try {
      const { data: dbData, error } = await supabase
        .from("notices")
        .select("*")
        .eq("type", "school_info")
        .order("id", { ascending: false })
        .limit(1);

      if (error) throw error;

      if (dbData && dbData.length > 0) {
        const payload = dbData[0].file_url || dbData[0].added_by || "{}";
        const extra = JSON.parse(payload);
        data = { ...data, ...extra };
      }
    } catch (e) {
      console.error("Supabase school-info fetch error:", e);
    }

    return NextResponse.json(data, { headers: PUBLIC_CACHE_HEADER });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    let data: any = {};
    try {
      const content = await readFile(infoPath, "utf-8");
      data = JSON.parse(content);
    } catch {}

    const { data: dbData, error: findErr } = await supabase
      .from("notices")
      .select("*")
      .eq("type", "school_info")
      .order("id", { ascending: false })
      .limit(1);

    if (findErr) {
      return NextResponse.json({ error: `ডাটাবেজ সংযোগ ব্যর্থ হয়েছে: ${findErr.message}` }, { status: 500 });
    }

    if (dbData && dbData.length > 0) {
      try {
        const payload = dbData[0].file_url || dbData[0].added_by || "{}";
        const extra = JSON.parse(payload);
        data = { ...data, ...extra };
      } catch {}
    }

    if (body.stats !== undefined) data.stats = body.stats;
    if (body.classes !== undefined) data.classes = body.classes;
    if (body.totalArea !== undefined) data.totalArea = body.totalArea;
    if (body.history !== undefined) data.history = { ...data.history, ...body.history };
    if (body.headmasterMessage !== undefined)
      data.headmasterMessage = { ...data.headmasterMessage, ...body.headmasterMessage };
    if (body.presidentMessage !== undefined)
      data.presidentMessage = { ...data.presidentMessage, ...body.presidentMessage };
    if (body.name !== undefined) data.name = { ...data.name, ...body.name };
    if (body.address !== undefined) data.address = { ...data.address, ...body.address };
    if (body.phone !== undefined) data.phone = body.phone;
    if (body.email !== undefined) data.email = body.email;
    if (body.eiin !== undefined) data.eiin = body.eiin;
    if (body.schoolCode !== undefined) data.schoolCode = body.schoolCode;
    if (body.established !== undefined) data.established = body.established;
    if (body.vocational !== undefined) data.vocational = { ...data.vocational, ...body.vocational };
    if (body.totalClasses !== undefined) data.totalClasses = { ...data.totalClasses, ...body.totalClasses };
    if (typeof body.showAlumniSection !== "undefined") data.showAlumniSection = body.showAlumniSection;

    const jsonString = JSON.stringify(data);
    const todayISO = new Date().toISOString().split("T")[0];

    if (dbData && dbData.length > 0) {
      const { error: updateErr } = await supabase
        .from("notices")
        .update({
          file_url: jsonString,
          date: todayISO,
          date_iso: todayISO,
        })
        .eq("id", dbData[0].id);

      if (updateErr) {
        return NextResponse.json({ error: `তথ্য আপডেট ব্যর্থ হয়েছে: ${updateErr.message}` }, { status: 500 });
      }
    } else {
      const { error: insertErr } = await supabase.from("notices").insert({
        id: (Date.now() % 2000000000) + 1000000,
        title: "School Info & Messages",
        type: "school_info",
        date: todayISO,
        date_iso: todayISO,
        file_url: jsonString,
        is_new: false,
      });

      if (insertErr) {
        return NextResponse.json({ error: `তথ্য সংরক্ষণ ব্যর্থ হয়েছে: ${insertErr.message}` }, { status: 500 });
      }
    }

    try {
      await writeFile(infoPath, JSON.stringify(data, null, 2), "utf-8");
    } catch {
      // Ignore read-only filesystem on serverless/Cloudflare
    }

    try {
      revalidatePath("/");
      revalidatePath("/about");
    } catch {}

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
