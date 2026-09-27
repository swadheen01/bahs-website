import { NextResponse } from "next/server";
import { readFile, writeFile } from "fs/promises";
import path from "path";

const infoPath = path.join(process.cwd(), "src", "data", "school-info.json");

export async function GET() {
  try {
    const content = await readFile(infoPath, "utf-8");
    return NextResponse.json(JSON.parse(content));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const content = await readFile(infoPath, "utf-8");
    const data = JSON.parse(content);

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

    await writeFile(infoPath, JSON.stringify(data, null, 2), "utf-8");

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

