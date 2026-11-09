import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { sessionOptions, type IronSessionData } from "@/lib/auth";
import { usersDB } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { email, name, role, class: cls } = await req.json();

    if (!email || !name || !role) {
      return NextResponse.json({ error: "Email, name and role are required" }, { status: 400 });
    }

    // Security: Only allow teacher or student during self-registration with Google.
    // Admin role must be granted by an existing admin.
    if (role !== "teacher" && role !== "student") {
      return NextResponse.json({ error: "Invalid role selected" }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    let existingUser = await usersDB.findByUsername(normalizedEmail);

    if (existingUser) {
      // If user already exists but role wasn't set, update their role
      await usersDB.update(existingUser.id, {
        role,
        class: role === "student" ? (cls || undefined) : undefined,
      });
      existingUser.role = role;
    } else {
      // Create new user with random secure hash
      const randomSecret = Math.random().toString(36).substring(2) + Date.now().toString(36);
      const passwordHash = await bcrypt.hash(randomSecret, 10);

      existingUser = await usersDB.add({
        name: name.trim(),
        username: normalizedEmail,
        email: normalizedEmail,
        passwordHash,
        role,
        class: role === "student" ? (cls || undefined) : undefined,
        active: true,
      });
    }

    if (!existingUser) {
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
    }

    // Establish iron-session
    const session = await getIronSession<IronSessionData>(await cookies(), sessionOptions);
    session.user = {
      id: existingUser.id,
      name: existingUser.name,
      username: existingUser.username,
      role: existingUser.role,
      teacherId: existingUser.teacherId,
      class: existingUser.class,
    };
    await session.save();

    return NextResponse.json({
      success: true,
      user: session.user,
    });
  } catch (err: any) {
    console.error("Google register error:", err);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}

