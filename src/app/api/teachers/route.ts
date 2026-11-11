import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, type IronSessionData } from "@/lib/auth";
import { teachersDB } from "@/lib/db";

export const dynamic = "force-dynamic";

const PUBLIC_CACHE_HEADER = { "Cache-Control": "no-cache, max-age=0, must-revalidate" };

async function getSession() {
  return getIronSession<IronSessionData>(await cookies(), sessionOptions);
}

export async function GET() {
  try {
    const teachers = await teachersDB.getAll();
    return NextResponse.json(teachers, { headers: PUBLIC_CACHE_HEADER });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "শিক্ষকদের তথ্য আনতে ব্যর্থ হয়েছে" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    const body = await req.json();
    const all = await teachersDB.getAll();
    const maxOrder = all.length > 0 ? Math.max(...all.map((t) => t.order || 0)) : 0;
    const newTeacher = await teachersDB.add({ ...body, order: maxOrder + 1 });
    try {
      revalidatePath("/administration/all-teachers");
      revalidatePath("/");
    } catch {}
    return NextResponse.json(newTeacher, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "শিক্ষকের তথ্য সংরক্ষণ ব্যর্থ হয়েছে" }, { status: 500 });
  }
}
