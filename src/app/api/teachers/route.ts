import { revalidatePath } from "@/lib/legacy-cache";
import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, type IronSessionData } from "@/lib/auth";
import { teachersDB } from "@/lib/db";

async function getSession() {
  return getIronSession<IronSessionData>(await cookies(), sessionOptions);
}

export async function GET() {
  const teachers = await teachersDB.getAll();
  return NextResponse.json(teachers);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.user || session.user.role !== "admin") {
    try { revalidatePath("/", "layout"); } catch(e) {} return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  const body = await req.json();
  const all = await teachersDB.getAll();
  const maxOrder = all.length > 0 ? Math.max(...all.map((t) => t.order)) : 0;
  const newTeacher = await teachersDB.add({ ...body, order: maxOrder + 1 });
  try { revalidatePath("/", "layout"); } catch(e) {} return NextResponse.json(newTeacher, { status: 201 });
}
