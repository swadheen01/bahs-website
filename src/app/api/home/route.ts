import { NextResponse } from "next/server";
import { getHomeData, PUBLIC_CACHE_HEADER } from "@/lib/publicData";

export const dynamic = "force-dynamic";

/** All homepage data in a single request (sliders, school info, notices, teachers, alumni). */
export async function GET() {
  try {
    const data = await getHomeData();
    return NextResponse.json(data, { headers: PUBLIC_CACHE_HEADER });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to load" }, { status: 500 });
  }
}
