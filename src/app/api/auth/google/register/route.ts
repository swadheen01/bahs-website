import { NextRequest, NextResponse } from "next/server";
import { usersDB } from "@/lib/db";
import { getSession, getVerifiedSupabaseUser, hashPassword } from "@/lib/serverAuth";

/**
 * First-time account creation for a Google (Supabase Auth) user.
 * Requires `Authorization: Bearer <supabase access token>`; the email comes from the verified token.
 */
export async function POST(req: NextRequest) {
  try {
    const authUser = await getVerifiedSupabaseUser(req);
    if (!authUser?.email) {
      return NextResponse.json({ error: "Google সেশন যাচাই করা যায়নি" }, { status: 401 });
    }

    const { name, role, class: cls } = await req.json();

    // Only teacher or student during self-registration. Admin must be granted by an existing admin.
    if (role !== "teacher" && role !== "student") {
      return NextResponse.json({ error: "Invalid role selected" }, { status: 400 });
    }

    const normalizedEmail = authUser.email.trim().toLowerCase();
    const existingUser = await usersDB.findByUsername(normalizedEmail);

    // Existing accounts can NOT change their role through this endpoint.
    if (existingUser) {
      return NextResponse.json({ error: "এই ইমেইলে আগে থেকেই অ্যাকাউন্ট আছে। লগইন করুন।" }, { status: 409 });
    }

    // Random password the user never sees (Google users log in via Google).
    const randomSecret = crypto.randomUUID() + crypto.randomUUID();
    const passwordHash = await hashPassword(randomSecret);
    const meta: any = authUser.user_metadata || {};
    const displayName = String(name || meta.full_name || meta.name || normalizedEmail.split("@")[0])
      .trim()
      .slice(0, 120);

    const created = await usersDB.add({
      name: displayName,
      username: normalizedEmail,
      email: normalizedEmail,
      passwordHash,
      role,
      class: role === "student" ? cls || undefined : undefined,
      active: true,
    });

    if (!created) {
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
    }

    const session = await getSession();
    session.user = {
      id: created.id,
      name: created.name,
      username: created.username,
      role: created.role,
      teacherId: created.teacherId ?? undefined,
      class: created.class ?? undefined,
    };
    await session.save();

    return NextResponse.json({ success: true, user: session.user });
  } catch (err: any) {
    console.error("Google register error:", err);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
