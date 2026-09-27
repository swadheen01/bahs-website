import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, type IronSessionData } from "@/lib/auth";
import { staffDB } from "@/lib/db";

async function getSession() {
  return getIronSession<IronSessionData>(await cookies(), sessionOptions);
}

export async function GET() {
  const staff = await staffDB.getAll();
  return NextResponse.json(staff);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  const body = await req.json();
  const all = await staffDB.getAll();
  const maxOrder = all.length > 0 ? Math.max(...all.map((s: any) => s.order)) : 0;
  const newStaff = await staffDB.add({ ...body, order: maxOrder + 1 });
  return NextResponse.json(newStaff, { status: 201 });
}
