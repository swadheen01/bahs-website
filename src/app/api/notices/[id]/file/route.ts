import { NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabaseServer";

/**
 * Serves a notice attachment that was stored inline as a base64 data URL (legacy uploads).
 * New uploads go to Supabase Storage and are linked directly, so this route is only for old notices.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const numId = Number(id);
  if (!Number.isInteger(numId) || numId <= 0) {
    return new NextResponse("Not found", { status: 404 });
  }

  const { data, error } = await supabase
    .from("notices")
    .select("file_url")
    .eq("id", numId)
    .maybeSingle();

  const fileUrl: string = data?.file_url || "";
  if (error || !fileUrl) {
    return new NextResponse("Not found", { status: 404 });
  }

  if (!fileUrl.startsWith("data:")) {
    return NextResponse.redirect(new URL(fileUrl, _req.url), 302);
  }

  const commaIdx = fileUrl.indexOf(",");
  const header = fileUrl.slice(5, commaIdx); // e.g. "application/pdf;base64"
  let mimeType = (header.split(";")[0] || "application/octet-stream").toLowerCase();
  // Never let a stored file render as an active page on our domain (stored XSS).
  const unsafe = /html|svg|xml|javascript/.test(mimeType);
  if (unsafe) mimeType = "application/octet-stream";
  const bytes = Buffer.from(fileUrl.slice(commaIdx + 1), "base64");

  return new NextResponse(bytes, {
    headers: {
      "Content-Type": mimeType,
      ...(unsafe ? { "Content-Disposition": "attachment" } : {}),
      "Content-Length": String(bytes.length),
      "Cache-Control": "public, max-age=86400",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
