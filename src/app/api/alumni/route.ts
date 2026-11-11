import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, type IronSessionData } from "@/lib/auth";
import { alumniDB } from "@/lib/db";

export const dynamic = "force-dynamic";

const PUBLIC_CACHE_HEADER = { "Cache-Control": "no-cache, max-age=0, must-revalidate" };

async function getSession() {
  return getIronSession<IronSessionData>(await cookies(), sessionOptions);
}

export async function GET() {
  try {
    const alumni = await alumniDB.getAll();
    return NextResponse.json(alumni, { headers: PUBLIC_CACHE_HEADER });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "কৃতি শিক্ষার্থীদের তথ্য আনতে ব্যর্থ হয়েছে" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    const body = await req.json();
    const newAlumni = await alumniDB.add({
      nameBengali: body.nameBengali,
      nameEnglish: body.nameEnglish || "",
      institution: body.institution,
      degree: body.degree,
      photo: body.photo || "/images/teachers/default-avatar.png",
      year: body.year || null,
    });
    try {
      revalidatePath("/alumni");
      revalidatePath("/");
    } catch {}
    return NextResponse.json(newAlumni, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "কৃতি শিক্ষার্থী সংরক্ষণ ব্যর্থ হয়েছে" }, { status: 500 });
  }
}
