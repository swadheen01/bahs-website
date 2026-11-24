import { NextRequest, NextResponse } from "next/server";
import { usersDB } from "@/lib/db";
import { getSession, getVerifiedSupabaseUser } from "@/lib/serverAuth";

/**
 * Logs in a user who signed in with Google via Supabase Auth.
 * Requires `Authorization: Bearer <supabase access token>`; the email comes from the verified token.
 */
export async function POST(req: NextRequest) {
  try {
    const authUser = await getVerifiedSupabaseUser(req);
    if (!authUser?.email) {
      return NextResponse.json({ error: "Google সেশন যাচাই করা যায়নি" }, { status: 401 });
    }

    const normalizedEmail = authUser.email.trim().toLowerCase();
    const existingUser = await usersDB.findByUsername(normalizedEmail);

    if (existingUser && existingUser.role) {
      const session = await getSession();
      session.user = {
        id: existingUser.id,
        name: existingUser.name,
        username: existingUser.username,
        role: existingUser.role,
        teacherId: existingUser.teacherId ?? undefined,
        class: existingUser.class ?? undefined,
      };
      await session.save();

      return NextResponse.json({ exists: true, user: session.user });
    }

    const meta: any = authUser.user_metadata || {};
    return NextResponse.json({
      exists: false,
      isFirstTime: true,
      email: normalizedEmail,
      name: meta.full_name || meta.name || normalizedEmail.split("@")[0],
    });
  } catch (err: any) {
    console.error("Google verify error:", err);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
