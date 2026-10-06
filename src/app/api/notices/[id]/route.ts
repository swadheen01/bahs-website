import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, type IronSessionData } from "@/lib/auth";
import { noticesDB } from "@/lib/db";

export const dynamic = "force-dynamic";

async function getSession() {
  return getIronSession<IronSessionData>(await cookies(), sessionOptions);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session.user || !["admin", "teacher"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  const { id } = await params;
  const body = await req.json();
  await noticesDB.update(parseInt(id), body);
  try {
    revalidatePath("/notices");
    revalidatePath("/");
  } catch (e) {}
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  const { id } = await params;
  await noticesDB.delete(parseInt(id));
  try {
    revalidatePath("/notices");
    revalidatePath("/");
  } catch (e) {}
  return NextResponse.json({ success: true });
}
