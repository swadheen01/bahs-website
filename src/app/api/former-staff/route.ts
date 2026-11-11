import { NextResponse } from "next/server";
import { readFile, writeFile } from "fs/promises";
import path from "path";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, type IronSessionData } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const dataFilePath = path.join(process.cwd(), "src", "data", "former-staff.json");
const DEFAULT_AVATAR = "/images/teachers/default-avatar.png";

const LEGACY_ID_MAP: Record<string, number> = {
  "fh-1": 1800000001,
  "fh-2": 1800000002,
  "fh-3": 1800000003,
  "ft-1": 1800000004,
  "ft-2": 1800000005,
  "ft-3": 1800000006,
};

export interface FormerStaffItem {
  id: string;
  name: string;
  nameEn: string;
  designation: string;
  designationEn: string;
  tenure: string;
  photo: string;
}

interface StoredFormerStaffPayload {
  category: "headmaster" | "teacher";
  name: string;
  nameEn: string;
  designation: string;
  designationEn: string;
  tenure: string;
  sortOrder?: number;
}

function resolveNumericId(rawId: unknown): number | null {
  const str = String(rawId || "").trim();
  if (!str) return null;
  if (LEGACY_ID_MAP[str]) return LEGACY_ID_MAP[str];
  const cleaned = str.replace(/^fs-/, "");
  const num = Number(cleaned);
  return Number.isInteger(num) && num > 0 && num <= 2147483647 ? num : null;
}

function parseFormerStaffRow(row: any): {
  item: FormerStaffItem;
  category: "headmaster" | "teacher";
  sortOrder: number;
} {
  let payload: Partial<StoredFormerStaffPayload> = {};
  try {
    if (typeof row.title === "string" && row.title.trim().startsWith("{")) {
      payload = JSON.parse(row.title);
    }
  } catch {}

  const category: "headmaster" | "teacher" =
    payload.category === "headmaster" || row.added_by === "headmaster"
      ? "headmaster"
      : "teacher";

  const fallbackDesignation =
    category === "headmaster" ? "প্রাক্তন প্রধান শিক্ষক" : "প্রাক্তন সহকারী শিক্ষক";
  const fallbackDesignationEn =
    category === "headmaster" ? "Former Headmaster" : "Former Assistant Teacher";

  const name = String(payload.name || row.title || "").trim();
  const designation = String(payload.designation || fallbackDesignation).trim();

  return {
    category,
    sortOrder: typeof payload.sortOrder === "number" ? payload.sortOrder : Number(row.id) || 0,
    item: {
      id: String(row.id),
      name,
      nameEn: String(payload.nameEn || name).trim(),
      designation,
      designationEn: String(payload.designationEn || designation || fallbackDesignationEn).trim(),
      tenure: String(payload.tenure || "").trim(),
      photo: String(row.file_url || "").trim() || DEFAULT_AVATAR,
    },
  };
}

async function getLocalData(): Promise<{ headmasters: FormerStaffItem[]; teachers: FormerStaffItem[] }> {
  try {
    const fileData = await readFile(dataFilePath, "utf-8");
    const parsed = JSON.parse(fileData);
    return {
      headmasters: Array.isArray(parsed?.headmasters) ? parsed.headmasters : [],
      teachers: Array.isArray(parsed?.teachers) ? parsed.teachers : [],
    };
  } catch {
    return { headmasters: [], teachers: [] };
  }
}

async function saveLocalData(data: { headmasters: FormerStaffItem[]; teachers: FormerStaffItem[] }) {
  try {
    await writeFile(dataFilePath, JSON.stringify(data, null, 2), "utf-8");
  } catch {
    // Ignore read-only filesystem in production (Cloudflare / serverless)
  }
}

async function fetchFromSupabase(): Promise<{
  headmasters: FormerStaffItem[];
  teachers: FormerStaffItem[];
  rawRows: any[];
}> {
  const { data, error } = await supabase
    .from("notices")
    .select("id, title, date, date_iso, type, file_url, added_by")
    .eq("type", "former_staff")
    .order("id", { ascending: true });

  if (error) {
    throw error;
  }

  const parsed = (data || []).map(parseFormerStaffRow);
  const headmasters = parsed
    .filter((entry) => entry.category === "headmaster")
    .sort((a, b) => a.sortOrder - b.sortOrder || Number(a.item.id) - Number(b.item.id))
    .map((entry) => entry.item);

  const teachers = parsed
    .filter((entry) => entry.category === "teacher")
    .sort((a, b) => a.sortOrder - b.sortOrder || Number(a.item.id) - Number(b.item.id))
    .map((entry) => entry.item);

  return { headmasters, teachers, rawRows: data || [] };
}

function generateUniqueId(existingIds: Set<number>): number {
  let candidate = (Date.now() % 2000000000) + 1000000;
  if (candidate > 2147483647) candidate = (candidate % 2000000000) + 1000000;
  while (existingIds.has(candidate)) {
    candidate = candidate >= 2147483646 ? 1800000100 : candidate + 1;
  }
  return candidate;
}

function revalidateFormerStaffPaths() {
  try {
    revalidatePath("/administration/former-staff");
    revalidatePath("/administration/former-teachers");
  } catch {}
}

export async function GET() {
  try {
    const { headmasters, teachers } = await fetchFromSupabase();
    return NextResponse.json(
      { headmasters, teachers },
      { headers: { "Cache-Control": "no-cache, max-age=0, must-revalidate" } }
    );
  } catch (err) {
    console.error("Supabase former-staff fetch error, falling back to local JSON:", err);
    const fallback = await getLocalData();
    return NextResponse.json(fallback, {
      headers: { "Cache-Control": "no-cache, max-age=0, must-revalidate" },
    });
  }
}

export async function POST(req: Request) {
  const session = await getIronSession<IronSessionData>(await cookies(), sessionOptions);
  if (!session.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const category: "headmaster" | "teacher" =
      body.category === "headmaster" ? "headmaster" : "teacher";
    const todayISO = new Date().toISOString().split("T")[0];

    if (body.action === "add") {
      const name = String(body.name || "").trim();
      const tenure = String(body.tenure || "").trim();
      if (!name || !tenure) {
        return NextResponse.json(
          { error: "দয়া করে নাম এবং কর্মকাল লিখুন" },
          { status: 400 }
        );
      }

      const { data: existingRows, error: listError } = await supabase
        .from("notices")
        .select("id, title, added_by")
        .eq("type", "former_staff");

      if (listError) {
        return NextResponse.json(
          { error: `ডাটাবেজ সংযোগ ব্যর্থ হয়েছে: ${listError.message}` },
          { status: 500 }
        );
      }

      const existingIds = new Set<number>((existingRows || []).map((r: any) => Number(r.id)));
      const categoryOrders = (existingRows || [])
        .map(parseFormerStaffRow)
        .filter((entry) => entry.category === category)
        .map((entry) => entry.sortOrder);
      const nextSortOrder = categoryOrders.length > 0 ? Math.max(...categoryOrders) + 1 : 1;

      const defaultDesignation =
        category === "headmaster" ? "প্রাক্তন প্রধান শিক্ষক" : "প্রাক্তন সহকারী শিক্ষক";
      const defaultDesignationEn =
        category === "headmaster" ? "Former Headmaster" : "Former Assistant Teacher";

      const payload: StoredFormerStaffPayload = {
        category,
        name,
        nameEn: String(body.nameEn || name).trim(),
        designation: String(body.designation || defaultDesignation).trim(),
        designationEn: String(body.designationEn || body.designation || defaultDesignationEn).trim(),
        tenure,
        sortOrder: nextSortOrder,
      };

      const photoUrl = String(body.photo || "").trim() || DEFAULT_AVATAR;
      const newId = generateUniqueId(existingIds);

      const { data: inserted, error: insertError } = await supabase
        .from("notices")
        .insert({
          id: newId,
          title: JSON.stringify(payload),
          date: todayISO,
          date_iso: todayISO,
          type: "former_staff",
          file_url: photoUrl,
          is_new: false,
          added_by: category,
        })
        .select()
        .single();

      if (insertError) {
        console.error("Supabase former_staff insert error:", insertError);
        return NextResponse.json(
          { error: `ডাটাবেজে সংরক্ষণ করা যায়নি: ${insertError.message}` },
          { status: 500 }
        );
      }

      const createdItem = parseFormerStaffRow(inserted).item;

      // Best-effort snapshot sync for local development
      try {
        const snapshot = await fetchFromSupabase();
        await saveLocalData({ headmasters: snapshot.headmasters, teachers: snapshot.teachers });
      } catch {}

      revalidateFormerStaffPaths();
      return NextResponse.json({ success: true, item: createdItem });
    }

    if (body.action === "edit") {
      const numericId = resolveNumericId(body.id);
      if (!numericId) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }

      const { data: existingRow, error: findError } = await supabase
        .from("notices")
        .select("*")
        .eq("id", numericId)
        .eq("type", "former_staff")
        .maybeSingle();

      if (findError) {
        return NextResponse.json(
          { error: `ডাটাবেজ ত্রুটি: ${findError.message}` },
          { status: 500 }
        );
      }
      if (!existingRow) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }

      const existingParsed = parseFormerStaffRow(existingRow);
      const name = String(body.name ?? existingParsed.item.name).trim();
      const tenure = String(body.tenure ?? existingParsed.item.tenure).trim();
      if (!name || !tenure) {
        return NextResponse.json(
          { error: "দয়া করে নাম এবং কর্মকাল লিখুন" },
          { status: 400 }
        );
      }

      const updatedPayload: StoredFormerStaffPayload = {
        category,
        name,
        nameEn: String(body.nameEn ?? existingParsed.item.nameEn ?? name).trim(),
        designation: String(body.designation ?? existingParsed.item.designation).trim(),
        designationEn: String(
          body.designationEn ?? body.designation ?? existingParsed.item.designationEn
        ).trim(),
        tenure,
        sortOrder: existingParsed.sortOrder,
      };

      const resolvedPhoto =
        body.photo !== undefined
          ? String(body.photo || "").trim() || DEFAULT_AVATAR
          : existingRow.file_url || DEFAULT_AVATAR;

      const { data: updatedRow, error: updateError } = await supabase
        .from("notices")
        .update({
          title: JSON.stringify(updatedPayload),
          date: todayISO,
          date_iso: todayISO,
          file_url: resolvedPhoto,
          added_by: category,
        })
        .eq("id", numericId)
        .eq("type", "former_staff")
        .select()
        .single();

      if (updateError) {
        console.error("Supabase former_staff update error:", updateError);
        return NextResponse.json(
          { error: `আপডেট ব্যর্থ হয়েছে: ${updateError.message}` },
          { status: 500 }
        );
      }

      const updatedItem = parseFormerStaffRow(updatedRow).item;

      try {
        const snapshot = await fetchFromSupabase();
        await saveLocalData({ headmasters: snapshot.headmasters, teachers: snapshot.teachers });
      } catch {}

      revalidateFormerStaffPaths();
      return NextResponse.json({ success: true, item: updatedItem });
    }

    if (body.action === "delete") {
      const numericId = resolveNumericId(body.id);
      if (!numericId) {
        return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
      }

      const { error: deleteError } = await supabase
        .from("notices")
        .delete()
        .eq("id", numericId)
        .eq("type", "former_staff");

      if (deleteError) {
        console.error("Supabase former_staff delete error:", deleteError);
        return NextResponse.json(
          { error: `মুছে ফেলা সম্ভব হয়নি: ${deleteError.message}` },
          { status: 500 }
        );
      }

      try {
        const snapshot = await fetchFromSupabase();
        await saveLocalData({ headmasters: snapshot.headmasters, teachers: snapshot.teachers });
      } catch {}

      revalidateFormerStaffPaths();
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Internal server error" }, { status: 500 });
  }
}
