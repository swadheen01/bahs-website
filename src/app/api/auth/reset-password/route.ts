import { NextRequest, NextResponse } from "next/server";
import { usersDB } from "@/lib/db";
import { getVerifiedSupabaseUser, hashPassword } from "@/lib/serverAuth";

/**
 * Sets a new password for the account belonging to the *verified* Supabase recovery session.
 * The caller must send `Authorization: Bearer <supabase access token>` obtained from the
 * password-recovery email link. The email is taken from the verified token, never from the body.
 */
export async function POST(req: NextRequest) {
  try {
    const authUser = await getVerifiedSupabaseUser(req);
    if (!authUser?.email) {
      return NextResponse.json({ error: "পাসওয়ার্ড রিসেট সেশন যাচাই করা যায়নি" }, { status: 401 });
    }

    const { password } = await req.json();
    if (!password || typeof password !== "string" || password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const user = await usersDB.findByUsername(authUser.email.trim().toLowerCase());
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const passwordHash = await hashPassword(password);
    await usersDB.update(user.id, { passwordHash });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Reset password error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
