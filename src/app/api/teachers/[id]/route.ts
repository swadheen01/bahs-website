import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, type IronSessionData } from "@/lib/auth";
import { teachersDB } from "@/lib/db";

async function getSession() {
  return getIronSession<IronSessionData>(await cookies(), sessionOptions);
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data } = await supabase.from('teachers').select('*').eq('id', id).single();
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(data);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session.user || session.user.role !== "admin") {
    try { revalidatePath("/", "layout"); } catch(e) {} return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  const { id } = await params;
  const body = await req.json();
  await teachersDB.update(parseInt(id), body);
  try { revalidatePath("/", "layout"); } catch(e) {} return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session.user || session.user.role !== "admin") {
    try { revalidatePath("/", "layout"); } catch(e) {} return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  const { id } = await params;
  await teachersDB.delete(parseInt(id));
  try { revalidatePath("/", "layout"); } catch(e) {} return NextResponse.json({ success: true });
}
