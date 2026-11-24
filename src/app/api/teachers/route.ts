import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, type IronSessionData } from "@/lib/auth";
import { teachersDB } from "@/lib/db";
import { getTeachers } from "@/lib/publicData";

export const dynamic = "force-dynamic";

const PUBLIC_CACHE_HEADER = { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" };

async function getSession() {
  return getIronSession<IronSessionData>(await cookies(), sessionOptions);
}

export async function GET(req: NextRequest) {
  try {
    // Unapproved pending edits are only visible to admins. Only read the session when a cookie
    // exists, so anonymous visitors don't pay for session decryption.
    let isAdmin = false;
    if (req.cookies.has("bahs_session")) {
      const session = await getSession().catch(() => null);
      isAdmin = session?.user?.role === "admin";
    }
    const teachers = await getTeachers({ includePending: isAdmin });
    return NextResponse.json(teachers, {
      headers: isAdmin ? { "Cache-Control": "private, no-store" } : PUBLIC_CACHE_HEADER,
    });
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
