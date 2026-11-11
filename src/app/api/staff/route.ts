import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, type IronSessionData } from "@/lib/auth";
import { staffDB } from "@/lib/db";

export const dynamic = "force-dynamic";

const PUBLIC_CACHE_HEADER = { "Cache-Control": "no-cache, max-age=0, must-revalidate" };

async function getSession() {
  return getIronSession<IronSessionData>(await cookies(), sessionOptions);
}

export async function GET() {
  try {
    const staff = await staffDB.getAll();
    return NextResponse.json(staff, { headers: PUBLIC_CACHE_HEADER });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "কর্মচারীদের তথ্য আনতে ব্যর্থ হয়েছে" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    const body = await req.json();
    const all = await staffDB.getAll();
    const maxOrder = all.length > 0 ? Math.max(...all.map((s: any) => s.order || 0)) : 0;
    const newStaff = await staffDB.add({ ...body, order: maxOrder + 1 });
    try {
      revalidatePath("/administration/staff");
    } catch {}
    return NextResponse.json(newStaff, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "কর্মচারী যুক্ত করতে ব্যর্থ হয়েছে" }, { status: 500 });
  }
}
