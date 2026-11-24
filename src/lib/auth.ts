import { SessionOptions } from "iron-session";

export interface IronSessionData {
  user?: {
    id: number;
    name: string;
    username: string;
    role: "admin" | "teacher" | "student";
    teacherId?: number;
    class?: string;
  };
}

const DEV_ONLY_SECRET = "bahs-local-development-only-secret-not-for-production-use";

function readSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (secret && secret.length >= 32) return secret;
  if (process.env.NODE_ENV === "production") {
    // Never fall back to a publicly known secret in production: anyone could forge an admin cookie.
    throw new Error("SESSION_SECRET is missing or shorter than 32 characters. Set it as a Cloudflare secret.");
  }
  return DEV_ONLY_SECRET;
}

// `password` is a getter so the secret is read at request time (Cloudflare populates env per request).
export const sessionOptions: SessionOptions = {
  get password() {
    return readSessionSecret();
  },
  cookieName: "bahs_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
  },
} as SessionOptions;
