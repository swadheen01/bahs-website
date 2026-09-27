import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, type IronSessionData } from "@/lib/auth";

export async function GET() {
  const session = await getIronSession<IronSessionData>(await cookies(), sessionOptions);
  
  if (session.user) {
    return NextResponse.json({
      user: session.user,
    });
  }
  
  return NextResponse.json({ user: null }, { status: 401 });
}

