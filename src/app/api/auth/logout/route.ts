import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, type IronSessionData } from "@/lib/auth";

export async function POST() {
  const session = await getIronSession<IronSessionData>(await cookies(), sessionOptions);
  session.destroy();
  return NextResponse.json({ success: true });
}

