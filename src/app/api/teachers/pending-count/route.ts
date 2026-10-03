import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, type IronSessionData } from "@/lib/auth";
import { pendingTeacherEditsDB } from "@/lib/db";

export async function GET() {
  const session = await getIronSession<IronSessionData>(await cookies(), sessionOptions);
  if (!session.user || session.user.role !== "admin") {
    return NextResponse.json({ count: 0 });
  }
  const count = await pendingTeacherEditsDB.getCount();
  return NextResponse.json({ count });
}

