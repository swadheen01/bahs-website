import { revalidatePath } from "@/lib/legacy-cache";
import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, type IronSessionData } from "@/lib/auth";
import { alumniDB } from "@/lib/db";

async function getSession() {
  return getIronSession<IronSessionData>(await cookies(), sessionOptions);
}

export async function GET() {
  const alumni = await alumniDB.getAll();
  return NextResponse.json(alumni);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.user || session.user.role !== "admin") {
    try { revalidatePath("/", "layout"); } catch(e) {} return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  const body = await req.json();
  const newAlumni = await alumniDB.add({
    nameBengali: body.nameBengali,
    nameEnglish: body.nameEnglish || "",
    institution: body.institution,
    degree: body.degree,
    photo: body.photo || "/images/alumni/default.jpg",
    year: body.year || null,
  });
  try { revalidatePath("/", "layout"); } catch(e) {} return NextResponse.json(newAlumni, { status: 201 });
}

