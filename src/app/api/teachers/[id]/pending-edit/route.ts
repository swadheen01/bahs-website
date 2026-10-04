import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, type IronSessionData } from "@/lib/auth";
import { pendingTeacherEditsDB } from "@/lib/db";

async function getSession() {
  return getIronSession<IronSessionData>(await cookies(), sessionOptions);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session.user || (session.user.role !== "admin" && session.user.role !== "teacher")) {
    try { revalidatePath("/", "layout"); } catch(e) {} return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  const { id } = await params;
  const teacherId = parseInt(id);
  const body = await req.json();
  await pendingTeacherEditsDB.submit(teacherId, body, session.user.name);
  try { revalidatePath("/", "layout"); } catch(e) {} return NextResponse.json({ success: true });
}

