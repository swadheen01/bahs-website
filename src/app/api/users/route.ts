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

export async function GET() {
  try {
    const session = await getSession();
    if (!session.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403, headers: { "Cache-Control": "no-store" } });
    }
    const users = await usersDB.getAll();
    const safeUsers = users.map(({ passwordHash, ...u }) => u);
    return NextResponse.json(safeUsers, { headers: { "Cache-Control": "no-store" } });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "ব্যবহারকারীর তালিকা আনতে ব্যর্থ হয়েছে" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { name, username, password, role, teacherId, class: cls } = body;

    if (!name || !username || !password || !role) {
      return NextResponse.json({ error: "All fields required" }, { status: 400 });
    }

    const existing = await usersDB.findByUsername(username);
    if (existing) {
      return NextResponse.json({ error: "Username already exists" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await usersDB.add({
      name,
      username,
      passwordHash,
      role,
      teacherId: teacherId || undefined,
      class: cls || undefined,
      active: true,
    });

    const { passwordHash: _, ...safeUser } = newUser;
    return NextResponse.json(safeUser, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "ব্যবহারকারী তৈরি ব্যর্থ হয়েছে" }, { status: 500 });
  }
}
