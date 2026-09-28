import { NextResponse } from "next/server";
import { readFile, writeFile } from "fs/promises";
import path from "path";
import { supabase } from "@/lib/supabase";

const infoPath = path.join(process.cwd(), "src", "data", "school-info.json");

export async function GET() {
  try {
    let data: any = {};
    try {
      const content = await readFile(infoPath, "utf-8");
      data = JSON.parse(content);
    } catch (e) {}

    // Check Supabase for updated school info
    try {
      const { data: dbData } = await supabase
        .from("notices")
        .select("*")
        .eq("type", "school_info")
        .order("id", { ascending: false })
        .limit(1);

      if (dbData && dbData.length > 0) {
        const extra = JSON.parse(dbData[0].added_by || "{}");
        data = { ...data, ...extra };
      }
    } catch (e) {}

    return NextResponse.json(data);
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
    } catch (e) {}

    // Update stats and classes if provided
    if (body.stats) data.stats = body.stats;
    if (body.classes) data.classes = body.classes;
    if (body.totalArea) data.totalArea = body.totalArea;
    if (body.history) data.history = { ...data.history, ...body.history };
    if (body.headmasterMessage) data.headmasterMessage = { ...data.headmasterMessage, ...body.headmasterMessage };
    if (body.presidentMessage) data.presidentMessage = { ...data.presidentMessage, ...body.presidentMessage };
    if (body.name) data.name = { ...data.name, ...body.name };
    if (body.address) data.address = { ...data.address, ...body.address };
    if (body.phone) data.phone = body.phone;
    if (body.email) data.email = body.email;
    if (body.eiin) data.eiin = body.eiin;
    if (body.schoolCode) data.schoolCode = body.schoolCode;
    if (body.established) data.established = body.established;
    if (body.vocational) data.vocational = { ...data.vocational, ...body.vocational };
    if (body.totalClasses) data.totalClasses = { ...data.totalClasses, ...body.totalClasses };

    // Sync to Supabase notices table where type='school_info'
    try {
      const { data: existing } = await supabase
        .from("notices")
        .select("id")
        .eq("type", "school_info")
        .limit(1);

      if (existing && existing.length > 0) {
        await supabase
          .from("notices")
          .update({
            added_by: JSON.stringify(data),
            date_iso: new Date().toISOString(),
          })
          .eq("id", existing[0].id);
      } else {
        await supabase.from("notices").insert({
          id: Date.now() % 2147483647,
          title: "School Info & Messages",
          type: "school_info",
          date: new Date().toLocaleDateString("bn-BD"),
          date_iso: new Date().toISOString(),
          added_by: JSON.stringify(data),
          is_new: false,
        });
      }
    } catch (e) {
      console.error("Supabase school-info sync error:", e);
    }

    try {
      await writeFile(infoPath, JSON.stringify(data, null, 2), "utf-8");
    } catch (e) {
      // Ignore read-only filesystem on Vercel
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
