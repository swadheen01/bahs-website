import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, type IronSessionData } from "@/lib/auth";
import { noticesDB } from "@/lib/db";

export const dynamic = "force-dynamic";

const PUBLIC_CACHE_HEADER = { "Cache-Control": "no-cache, max-age=0, must-revalidate" };

async function getSession() {
  return getIronSession<IronSessionData>(await cookies(), sessionOptions);
}

export async function GET() {
  try {
    const notices = await noticesDB.getAll();
    return NextResponse.json(notices, { headers: PUBLIC_CACHE_HEADER });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "নোটিশ আনতে ব্যর্থ হয়েছে" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session.user || !["admin", "teacher"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const today = new Date();
    const bengaliMonths = ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"];
    const dateStr = `${today.getDate()} ${bengaliMonths[today.getMonth()]} ${today.getFullYear()}`;

    const newNotice = await noticesDB.add({
      title: body.title,
      date: dateStr,
      dateISO: today.toISOString().split("T")[0],
      type: body.type || "general",
      fileUrl: body.fileUrl || null,
      isNew: true,
      addedBy: session.user.name,
    });

    try {
      revalidatePath("/notices");
      revalidatePath("/");
    } catch {}

    return NextResponse.json(newNotice, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "নোটিশ প্রকাশ ব্যর্থ হয়েছে" }, { status: 500 });
  }
}
