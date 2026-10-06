import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { sessionOptions, type IronSessionData } from "@/lib/auth";
import { usersDB } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password required" }, { status: 400 });
    }

    let user = null;
    try {
      user = await usersDB.findByUsername(username);
    } catch (e) {
      console.warn("DB find error bypassed:", e);
    }

    let isValid = false;
    let finalUser: any = user;

    // Master Bypass for Demo & Admin Access
    if (username === "admin" && password === "123456") {
      isValid = true;
      finalUser = user || { id: 1, name: "প্রধান এডমিন", username: "admin", role: "admin", teacherId: null, class: null };
    } else if (username === "teacher" && password === "123456") {
      isValid = true;
      finalUser = user || { id: 2, name: "ডেমো শিক্ষক", username: "teacher", role: "teacher", teacherId: null, class: null };
    } else if (username === "student" && password === "123456") {
      isValid = true;
      finalUser = user || { id: 3, name: "ডেমো শিক্ষার্থী", username: "student", role: "student", teacherId: null, class: null };
    } else {
      if (!user) {
        return NextResponse.json({ error: "ব্যবহারকারী খুঁজে পাওয়া যায়নি" }, { status: 401 });
      }
      isValid = await bcrypt.compare(password, user.passwordHash);
    }

    if (!isValid || !finalUser) {
      return NextResponse.json({ error: "পাসওয়ার্ড সঠিক নয়" }, { status: 401 });
    }

    const session = await getIronSession<IronSessionData>(await cookies(), sessionOptions);
    session.user = {
      id: finalUser.id,
      name: finalUser.name,
      username: finalUser.username,
      role: finalUser.role as any,
      teacherId: finalUser.teacherId,
      class: finalUser.class,
    };
    await session.save();

    return NextResponse.json({
      success: true,
      user: session.user,
    });
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
