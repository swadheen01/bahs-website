import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, type IronSessionData } from "@/lib/auth";
import { pendingTeacherEditsDB } from "@/lib/db";

export const dynamic = "force-dynamic";

async function getSession() {
  return getIronSession<IronSessionData>(await cookies(), sessionOptions);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session.user || (session.user.role !== "admin" && session.user.role !== "teacher")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    const { id } = await params;
    const teacherId = parseInt(id, 10);
    if (!Number.isInteger(teacherId) || teacherId <= 0) {
      return NextResponse.json({ error: "Invalid teacher id" }, { status: 400 });
    }
    // By design any teacher may *request* a change to any teacher profile; nothing is applied
    // until an admin approves it (see /api/teachers/[id]/approve).
    const body = await req.json();
    // Only accept known profile fields (approve() applies only these anyway).
    const ALLOWED = [
      "nameEnglish", "photo", "mpoIndex", "joiningDate", "birthDate", "email", "contactNo",
      "qualification", "experience", "mainSubject", "courses", "presentAddress", "permanentAddress",
    ];
    const cleanEdit: Record<string, unknown> = {};
    for (const key of ALLOWED) {
      if (body && body[key] !== undefined) cleanEdit[key] = body[key];
    }
    await pendingTeacherEditsDB.submit(teacherId, cleanEdit, session.user.name);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "আবেদন জমা দিতে ব্যর্থ হয়েছে" }, { status: 500 });
  }
}
