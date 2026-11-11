import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, type IronSessionData } from "@/lib/auth";
import { teachersDB } from "@/lib/db";

export const dynamic = "force-dynamic";

const PUBLIC_CACHE_HEADER = { "Cache-Control": "no-cache, max-age=0, must-revalidate" };

async function getSession() {
  return getIronSession<IronSessionData>(await cookies(), sessionOptions);
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { data, error } = await supabase.from("teachers").select("*").eq("id", id).maybeSingle();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(data, { headers: PUBLIC_CACHE_HEADER });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    const { id } = await params;
    const numId = parseInt(id, 10);
    if (!Number.isInteger(numId) || numId <= 0) {
      return NextResponse.json({ error: "Invalid teacher id" }, { status: 400 });
    }
    const body = await req.json();
    await teachersDB.update(numId, body);
    try {
      revalidatePath("/administration/all-teachers");
      revalidatePath(`/administration/all-teachers/${id}`);
      revalidatePath("/");
    } catch {}
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "শিক্ষকের তথ্য আপডেট ব্যর্থ হয়েছে" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    const { id } = await params;
    const numId = parseInt(id, 10);
    if (!Number.isInteger(numId) || numId <= 0) {
      return NextResponse.json({ error: "Invalid teacher id" }, { status: 400 });
    }
    await teachersDB.delete(numId);
    try {
      revalidatePath("/administration/all-teachers");
      revalidatePath(`/administration/all-teachers/${id}`);
      revalidatePath("/");
    } catch {}
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "শিক্ষক মুছে ফেলতে ব্যর্থ হয়েছে" }, { status: 500 });
  }
}
