import { NextRequest, NextResponse } from "next/server";
import { usersDB } from "@/lib/db";
import { hashPassword } from "@/lib/serverAuth";

const ALLOWED_CLASSES = new Set(["6", "7", "8", "9", "10", "class-6", "class-7", "class-8", "class-9", "class-10"]);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, username, password, role, class: cls } = body;

    if (!name || !username || !password || !role) {
      return NextResponse.json({ error: "All fields required" }, { status: 400 });
    }
    if (typeof password !== "string" || password.length < 6) {
      return NextResponse.json({ error: "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে" }, { status: 400 });
    }
    const cleanUsername = String(username).trim().toLowerCase();
    if (!/^[a-z0-9._@-]{3,60}$/.test(cleanUsername)) {
      return NextResponse.json({ error: "ইউজারনেম সঠিক নয় (৩-৬০ অক্ষর, ইংরেজি অক্ষর/সংখ্যা)" }, { status: 400 });
    }

    const existing = await usersDB.findByUsername(cleanUsername);
    if (existing) {
      return NextResponse.json({ error: "ইউজারনেমটি আগে থেকেই ব্যবহার করা হয়েছে" }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);
    const finalRole = role === "teacher" ? "teacher" : "student";

    // Self-registered teachers get NO teacherId; an admin must link the account to a teacher profile.
    await usersDB.add({
      name: String(name).trim().slice(0, 120),
      username: cleanUsername,
      passwordHash,
      role: finalRole,
      class: finalRole === "student" && ALLOWED_CLASSES.has(String(cls)) ? String(cls) : undefined,
      active: true,
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
