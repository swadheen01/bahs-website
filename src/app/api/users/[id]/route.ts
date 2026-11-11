import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, type IronSessionData } from "@/lib/auth";
import { usersDB } from "@/lib/db";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

async function getSession() {
  return getIronSession<IronSessionData>(await cookies(), sessionOptions);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    const { id } = await params;
    const numId = parseInt(id, 10);
    if (!Number.isInteger(numId) || numId <= 0) {
      return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
    }
    const body = await req.json();

    const updates: any = {};
    if (body.name !== undefined) updates.name = body.name;
    if (body.role !== undefined) updates.role = body.role;
    if (body.teacherId !== undefined) updates.teacherId = body.teacherId;
    if (body.class !== undefined) updates.class = body.class;
    if (body.active !== undefined) updates.active = body.active;

    if (body.password) {
      updates.passwordHash = await bcrypt.hash(body.password, 10);
    }

    await usersDB.update(numId, updates);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "ব্যবহারকারী আপডেট ব্যর্থ হয়েছে" }, { status: 500 });
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
      return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
    }
    if (numId === session.user.id) {
      return NextResponse.json({ error: "Cannot delete own account" }, { status: 400 });
    }
    await usersDB.delete(numId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "ব্যবহারকারী নিষ্ক্রিয় করতে ব্যর্থ হয়েছে" }, { status: 500 });
  }
}
