import { revalidatePath } from "@/lib/legacy-cache";
import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, type IronSessionData } from "@/lib/auth";
import { pendingTeacherEditsDB } from "@/lib/db";

async function getSession() {
  return getIronSession<IronSessionData>(await cookies(), sessionOptions);
}

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session.user || session.user.role !== "admin") {
    try { revalidatePath("/", "layout"); } catch(e) {} return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  const { id } = await params;
  try {
    await pendingTeacherEditsDB.reject(parseInt(id));
    try { revalidatePath("/", "layout"); } catch(e) {} return NextResponse.json({ success: true });
  } catch (e: any) {
    try { revalidatePath("/", "layout"); } catch(e) {} return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

