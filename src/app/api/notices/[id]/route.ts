import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, type IronSessionData } from "@/lib/auth";
import { noticesDB } from "@/lib/db";

export const dynamic = "force-dynamic";

async function getSession() {
  return getIronSession<IronSessionData>(await cookies(), sessionOptions);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session.user || !["admin", "teacher"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    const { id } = await params;
    const numId = parseInt(id, 10);
    if (!Number.isInteger(numId) || numId <= 0) {
      return NextResponse.json({ error: "Invalid notice id" }, { status: 400 });
    }
    const body = await req.json();
    await noticesDB.update(numId, body);
    try {
      revalidatePath("/notices");
      revalidatePath("/");
    } catch {}
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "নোটিশ আপডেট ব্যর্থ হয়েছে" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    const { id } = await params;
    const numId = parseInt(id, 10);
    if (!Number.isInteger(numId) || numId <= 0) {
      return NextResponse.json({ error: "Invalid notice id" }, { status: 400 });
    }
    await noticesDB.delete(numId);
    try {
      revalidatePath("/notices");
      revalidatePath("/");
    } catch {}
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "নোটিশ মুছে ফেলতে ব্যর্থ হয়েছে" }, { status: 500 });
  }
}
