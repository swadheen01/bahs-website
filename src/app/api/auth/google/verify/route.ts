import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, type IronSessionData } from "@/lib/auth";
import { usersDB } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { email, name } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await usersDB.findByUsername(normalizedEmail);

    if (existingUser && existingUser.role) {
      // User exists with an established role - log them in directly
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
        exists: true,
        user: session.user,
      });
    }

    // First time user or user without a role
    return NextResponse.json({
      exists: false,
      isFirstTime: true,
      email: normalizedEmail,
      name: name || normalizedEmail.split("@")[0],
    });
  } catch (err: any) {
    console.error("Google verify error:", err);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}

