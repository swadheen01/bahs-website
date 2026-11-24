import { NextRequest, NextResponse } from "next/server";
import { usersDB } from "@/lib/db";
import { getSession, verifyPassword } from "@/lib/serverAuth";

const INVALID_LOGIN = "ইউজারনেম অথবা পাসওয়ার্ড সঠিক নয়";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password || typeof username !== "string" || typeof password !== "string") {
      return NextResponse.json({ error: "Username and password required" }, { status: 400 });
    }

    const user = await usersDB.findByUsername(username);
    // Same message for unknown user / wrong password so usernames cannot be enumerated.
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return NextResponse.json({ error: INVALID_LOGIN }, { status: 401 });
    }

    const session = await getSession();
    session.user = {
      id: user.id,
      name: user.name,
      username: user.username,
      role: user.role,
      teacherId: user.teacherId ?? undefined,
      class: user.class ?? undefined,
    };
    await session.save();

    return NextResponse.json({ success: true, user: session.user });
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
