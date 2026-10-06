import { NextRequest, NextResponse } from "next/server";
import { usersDB } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, username, password, role, class: cls } = body;

    if (!name || !username || !password || !role) {
      return NextResponse.json({ error: "All fields required" }, { status: 400 });
    }

    const existing = await usersDB.findByUsername(username);
    if (existing) {
      return NextResponse.json({ error: "ইউজারনেমটি আগে থেকেই ব্যবহার করা হয়েছে" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    
    await usersDB.add({
      name, 
      username, 
      passwordHash, 
      role: role === "teacher" ? "teacher" : "student",
      class: role === "student" ? cls : undefined,
      active: true,
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
