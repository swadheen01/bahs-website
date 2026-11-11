import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, type IronSessionData } from "@/lib/auth";
import { pendingTeacherEditsDB } from "@/lib/db";

export const dynamic = "force-dynamic";

async function getSession() {
  return getIronSession<IronSessionData>(await cookies(), sessionOptions);
}

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    const { id } = await params;
    const teacherId = parseInt(id, 10);
    if (!Number.isInteger(teacherId) || teacherId <= 0) {
      return NextResponse.json({ error: "Invalid teacher id" }, { status: 400 });
    }
    await pendingTeacherEditsDB.reject(teacherId);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "বাতিল ব্যর্থ হয়েছে" }, { status: 400 });
  }
}
