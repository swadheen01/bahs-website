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

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET || "bahs-website-super-secret-key-2025-change-in-prod-must-be-32-chars-long",
  cookieName: "bahs_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};

