import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { sessionOptions, type IronSessionData } from "./auth";
import { supabaseAdmin } from "./supabaseServer";

type Role = "admin" | "teacher" | "student";

export async function getSession() {
  return getIronSession<IronSessionData>(await cookies(), sessionOptions);
}

/**
 * Returns a 403 response if the current user does not have one of the roles, otherwise null.
 * Usage: `const denied = await requireRole("admin"); if (denied) return denied;`
 */
export async function requireRole(...roles: Role[]): Promise<NextResponse | null> {
  try {
    const session = await getSession();
    if (session.user && roles.includes(session.user.role)) return null;
  } catch (e) {
    console.error("Session read failed:", e);
  }
  return NextResponse.json(
    { error: "Unauthorized" },
    { status: 403, headers: { "Cache-Control": "no-store" } }
  );
}

export const requireAdmin = () => requireRole("admin");

// ─── Password hashing ──────────────────────────────────────────────────────
// bcrypt in pure JavaScript costs ~80-100ms of CPU, far above the Cloudflare free-tier
// 10ms limit. When the SQL functions from supabase_security_migration.sql are installed,
// hashing runs inside Postgres (pgcrypto) instead, costing the Worker almost no CPU.
// Falls back to bcryptjs if the functions are not installed yet.

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  if (!password || !hash) return false;
  try {
    const { data, error } = await supabaseAdmin.rpc("app_check_password", {
      p_password: password,
      p_hash: hash,
    });
    if (!error && typeof data === "boolean") return data;
  } catch {}
  return bcrypt.compare(password, hash);
}

export async function hashPassword(password: string): Promise<string> {
  try {
    const { data, error } = await supabaseAdmin.rpc("app_hash_password", { p_password: password });
    if (!error && typeof data === "string" && data.startsWith("$2")) return data;
  } catch {}
  return bcrypt.hash(password, 10);
}

/**
 * Verifies a Supabase Auth access token (from Google OAuth / password recovery) on the server
 * and returns the verified email. Never trust an email sent in a request body.
 */
export async function getVerifiedSupabaseUser(req: Request) {
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  if (!token) return null;
  try {
    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !data?.user?.email) return null;
    return data.user;
  } catch {
    return null;
  }
}
