import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, type IronSessionData } from "@/lib/auth";
import { usersDB } from "@/lib/db";
import bcrypt from "bcryptjs";

async function getSession() {
  return getIronSession<IronSessionData>(await cookies(), sessionOptions);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  const { id } = await params;
  const body = await req.json();

  const updates: any = {
    name: body.name,
    role: body.role,
    teacherId: body.teacherId,
    class: body.class,
    active: body.active,
  };

  if (body.password) {
    updates.passwordHash = await bcrypt.hash(body.password, 10);
  }

  await usersDB.update(parseInt(id), updates);
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  const { id } = await params;
  if (parseInt(id) === session.user.id) {
    return NextResponse.json({ error: "Cannot delete own account" }, { status: 400 });
  }
  await usersDB.delete(parseInt(id));
  return NextResponse.json({ success: true });
}

