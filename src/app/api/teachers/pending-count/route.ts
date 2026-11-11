import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, type IronSessionData } from "@/lib/auth";
import { pendingTeacherEditsDB } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getIronSession<IronSessionData>(await cookies(), sessionOptions);
    if (!session.user || session.user.role !== "admin") {
      return NextResponse.json({ count: 0 }, { headers: { "Cache-Control": "no-store" } });
    }
    const count = await pendingTeacherEditsDB.getCount();
    return NextResponse.json({ count }, { headers: { "Cache-Control": "no-store" } });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "পেন্ডিং গণনা ব্যর্থ হয়েছে", count: 0 },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
