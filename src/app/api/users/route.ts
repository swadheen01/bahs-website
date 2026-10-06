import { revalidatePath } from "@/lib/legacy-cache";
import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, type IronSessionData } from "@/lib/auth";
import { usersDB } from "@/lib/db";
import bcrypt from "bcryptjs";

async function getSession() {
  return getIronSession<IronSessionData>(await cookies(), sessionOptions);
}

export async function GET() {
  const session = await getSession();
  if (!session.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  const users = await usersDB.getAll();
  const safeUsers = users.map(({ passwordHash, ...u }) => u);
  return NextResponse.json(safeUsers);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.user || session.user.role !== "admin") {
    try { revalidatePath("/", "layout"); } catch(e) {} return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json();
  const { name, username, password, role, teacherId, class: cls } = body;

  if (!name || !username || !password || !role) {
    try { revalidatePath("/", "layout"); } catch(e) {} return NextResponse.json({ error: "All fields required" }, { status: 400 });
  }

  const existing = await usersDB.findByUsername(username);
  if (existing) {
    try { revalidatePath("/", "layout"); } catch(e) {} return NextResponse.json({ error: "Username already exists" }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const newUser = await usersDB.add({
    name, username, passwordHash, role,
    teacherId: teacherId || undefined,
    class: cls || undefined,
    active: true,
  });

  const { passwordHash: _, ...safeUser } = newUser;
  try { revalidatePath("/", "layout"); } catch(e) {} return NextResponse.json(safeUser, { status: 201 });
}

