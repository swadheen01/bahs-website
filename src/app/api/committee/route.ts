import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { readFile, writeFile } from "fs/promises";
import path from "path";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const committeeFilePath = path.join(process.cwd(), "src", "data", "committee.json");
const PUBLIC_CACHE_HEADER = { "Cache-Control": "no-cache, max-age=0, must-revalidate" };

const LEGACY_COMMITTEE_IDS: Record<string, number> = {
  "mc-1": 1820000001,
  "mc-2": 1820000002,
  "mc-3": 1820000003,
  "mc-4": 1820000004,
  "mc-5": 1820000005,
  "mc-6": 1820000006,
  "mc-7": 1820000007,
  "mc-8": 1820000008,
  "mc-9": 1820000009,
};

function resolveCommitteeNumericId(rawId: unknown): number | null {
  const str = String(rawId || "").trim();
  if (!str) return null;
  if (LEGACY_COMMITTEE_IDS[str]) return LEGACY_COMMITTEE_IDS[str];
  const cleaned = str.replace(/^mc-/, "");
  const num = Number(cleaned);
  return Number.isInteger(num) && num > 0 && num <= 2147483647 ? num : null;
}

function generateUniqueCommitteeId(existingIds: Set<number>): number {
  let candidate = (Date.now() % 2000000000) + 1000000;
  if (candidate > 2147483647) candidate = (candidate % 2000000000) + 1000000;
  while (existingIds.has(candidate)) {
    candidate = candidate >= 2147483646 ? 1820000100 : candidate + 1;
  }
  return candidate;
}

function parseCommitteeRow(item: any) {
  let titlePayload: any = null;
  try {
    if (typeof item.title === "string" && item.title.trim().startsWith("{")) {
      titlePayload = JSON.parse(item.title);
    }
  } catch {}

  let extra: any = {};
  if (titlePayload) {
    extra = titlePayload;
  } else {
    try {
      extra = JSON.parse(item.added_by || "{}");
    } catch {}
  }

  const legacyPhone =
    item.date_iso && !/^\d{4}-\d{2}-\d{2}$/.test(String(item.date_iso)) ? String(item.date_iso) : "";
  const resolvedName = String(titlePayload?.name ?? item.title ?? "").trim();
  const resolvedDesignation = String(titlePayload?.designation ?? item.date ?? "").trim();

  return {
    sortOrder: typeof extra.sortOrder === "number" ? extra.sortOrder : Number(item.id) || 0,
    member: {
      id: String(item.id),
      name: resolvedName,
      nameEn: String(extra.nameEn || resolvedName),
      designation: resolvedDesignation,
      designationEn: String(extra.designationEn || resolvedDesignation),
      category: String(extra.category || "অভিভাবক প্রতিনিধি"),
      phone: extra.phone !== undefined ? String(extra.phone) : legacyPhone,
      photo: item.file_url || "/images/teachers/default-avatar.png",
      term: String(extra.term || "২০২৪ - ২০২৬"),
      bio: String(extra.bio || ""),
    },
  };
}

async function getCommitteeData() {
  try {
    const data = await readFile(committeeFilePath, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function saveCommitteeData(data: any[]) {
  try {
    await writeFile(committeeFilePath, JSON.stringify(data, null, 2), "utf-8");
  } catch {
    // Ignore read-only filesystem on serverless/Cloudflare
  }
}

async function fetchCommitteeFromSupabase() {
  const { data, error } = await supabase
    .from("notices")
    .select("*")
    .eq("type", "committee")
    .order("id", { ascending: true });

  if (error) throw error;

  return (data || [])
    .map(parseCommitteeRow)
    .sort((a, b) => a.sortOrder - b.sortOrder || Number(a.member.id) - Number(b.member.id))
    .map((entry) => entry.member);
}

function revalidateCommitteePaths() {
  try {
    revalidatePath("/administration/managing-committee");
    revalidatePath("/about");
  } catch {}
}

export async function GET() {
  try {
    const members = await fetchCommitteeFromSupabase();
    return NextResponse.json({ success: true, members }, { headers: PUBLIC_CACHE_HEADER });
  } catch (error) {
    console.error("Supabase committee fetch error, falling back to local JSON:", error);
    const localMembers = await getCommitteeData();
    return NextResponse.json({ success: true, members: localMembers }, { headers: PUBLIC_CACHE_HEADER });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const todayISO = new Date().toISOString().split("T")[0];

    if (body.id) {
      const numId = resolveCommitteeNumericId(body.id);
      if (!numId) {
        return NextResponse.json({ error: "Invalid member id" }, { status: 400 });
      }

      const { data: existingRow, error: findError } = await supabase
        .from("notices")
        .select("*")
        .eq("id", numId)
        .eq("type", "committee")
        .maybeSingle();

      if (findError) {
        return NextResponse.json({ error: `ডাটাবেজ ত্রুটি: ${findError.message}` }, { status: 500 });
      }
      if (!existingRow) {
        return NextResponse.json({ error: "Member not found" }, { status: 404 });
      }

      const prev = parseCommitteeRow(existingRow);
      const name = String(body.name ?? prev.member.name).trim();
      const designation = String(body.designation ?? prev.member.designation).trim();
      if (!name || !designation) {
        return NextResponse.json({ error: "নাম এবং পদবী আবশ্যক" }, { status: 400 });
      }

      const extraPayload = {
        name,
        nameEn: String(body.nameEn ?? prev.member.nameEn ?? name).trim(),
        designation,
        designationEn: String(body.designationEn ?? prev.member.designationEn ?? designation).trim(),
        category: String(body.category ?? prev.member.category ?? "অভিভাবক প্রতিনিধি").trim(),
        phone: String(body.phone ?? prev.member.phone ?? "").trim(),
        term: String(body.term ?? prev.member.term ?? "২০২৪ - ২০২৬").trim(),
        bio: body.bio !== undefined ? String(body.bio).trim() : prev.member.bio,
        sortOrder: prev.sortOrder,
      };

      const resolvedPhoto =
        body.photo !== undefined
          ? String(body.photo || "").trim() || "/images/teachers/default-avatar.png"
          : existingRow.file_url || "/images/teachers/default-avatar.png";

      const { data: updatedRow, error: updateError } = await supabase
        .from("notices")
        .update({
          title: JSON.stringify(extraPayload),
          date: designation.slice(0, 50),
          date_iso: todayISO,
          file_url: resolvedPhoto,
          added_by: extraPayload.category.slice(0, 250),
        })
        .eq("id", numId)
        .eq("type", "committee")
        .select()
        .single();

      if (updateError) {
        return NextResponse.json({ error: `আপডেট ব্যর্থ হয়েছে: ${updateError.message}` }, { status: 500 });
      }

      const updatedMember = parseCommitteeRow(updatedRow).member;
      try {
        const latest = await fetchCommitteeFromSupabase();
        await saveCommitteeData(latest);
      } catch {}

      revalidateCommitteePaths();
      return NextResponse.json({ success: true, member: updatedMember });
    }

    const name = String(body.name || "").trim();
    const designation = String(body.designation || "").trim();
    if (!name || !designation) {
      return NextResponse.json({ error: "নাম এবং পদবী আবশ্যক" }, { status: 400 });
    }

    const { data: existingRows, error: listError } = await supabase
      .from("notices")
      .select("id, title, date, date_iso, file_url, added_by")
      .eq("type", "committee");

    if (listError) {
      return NextResponse.json({ error: `ডাটাবেজ সংযোগ ব্যর্থ হয়েছে: ${listError.message}` }, { status: 500 });
    }

    const existingIds = new Set<number>((existingRows || []).map((r: any) => Number(r.id)));
    const orders = (existingRows || []).map((r: any) => parseCommitteeRow(r).sortOrder);
    const nextSortOrder = orders.length > 0 ? Math.max(...orders) + 1 : 1;
    const numId = generateUniqueCommitteeId(existingIds);

    const extraPayload = {
      name,
      nameEn: String(body.nameEn || name).trim(),
      designation,
      designationEn: String(body.designationEn || designation).trim(),
      category: String(body.category || "অভিভাবক প্রতিনিধি").trim(),
      phone: String(body.phone || "").trim(),
      term: String(body.term || "২০২৪ - ২০২৬").trim(),
      bio: String(body.bio || "").trim(),
      sortOrder: nextSortOrder,
    };

    const photo = String(body.photo || "").trim() || "/images/teachers/default-avatar.png";

    const { data: insertedRow, error: insertError } = await supabase
      .from("notices")
      .insert({
        id: numId,
        title: JSON.stringify(extraPayload),
        date: designation.slice(0, 50),
        date_iso: todayISO,
        file_url: photo,
        type: "committee",
        added_by: extraPayload.category.slice(0, 250),
        is_new: false,
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ error: `ডাটাবেজে সংরক্ষণ ব্যর্থ হয়েছে: ${insertError.message}` }, { status: 500 });
    }

    const newMember = parseCommitteeRow(insertedRow).member;
    let latestMembers: any[] = [newMember];
    try {
      latestMembers = await fetchCommitteeFromSupabase();
      await saveCommitteeData(latestMembers);
    } catch {}

    revalidateCommitteePaths();
    return NextResponse.json({ success: true, member: newMember, members: latestMembers });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    let id = searchParams.get("id");

    if (!id) {
      const body = await req.json().catch(() => ({}));
      id = body.id;
    }

    if (!id) {
      return NextResponse.json({ error: "Missing member id" }, { status: 400 });
    }

    const numId = resolveCommitteeNumericId(id);
    if (!numId) {
      return NextResponse.json({ error: "Invalid member id" }, { status: 400 });
    }

    const { error: deleteError } = await supabase
      .from("notices")
      .delete()
      .eq("id", numId)
      .eq("type", "committee");

    if (deleteError) {
      return NextResponse.json({ error: `মুছে ফেলা সম্ভব হয়নি: ${deleteError.message}` }, { status: 500 });
    }

    let latestMembers: any[] = [];
    try {
      latestMembers = await fetchCommitteeFromSupabase();
      await saveCommitteeData(latestMembers);
    } catch {}

    revalidateCommitteePaths();
    return NextResponse.json({ success: true, members: latestMembers });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
