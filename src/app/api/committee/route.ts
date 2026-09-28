import { NextResponse } from "next/server";
import { readFile, writeFile } from "fs/promises";
import path from "path";
import { supabase } from "@/lib/supabase";

const committeeFilePath = path.join(process.cwd(), "src", "data", "committee.json");

async function getCommitteeData() {
  try {
    const data = await readFile(committeeFilePath, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

async function saveCommitteeData(data: any) {
  try {
    await writeFile(committeeFilePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    // Ignore read-only filesystem on Vercel
  }
}

export async function GET() {
  try {
    const localMembers = await getCommitteeData();

    let dbMembers: any[] = [];
    try {
      const { data: dbData } = await supabase
        .from("notices")
        .select("*")
        .eq("type", "committee")
        .order("id", { ascending: true });

      if (dbData && dbData.length > 0) {
        dbMembers = dbData
          .map((item: any) => {
            try {
              const extra = JSON.parse(item.added_by || "{}");
              return {
                id: String(item.id),
                name: item.title,
                nameEn: extra.nameEn || item.title,
                designation: item.date,
                designationEn: extra.designationEn || item.date,
                category: extra.category || "অভিভাবক প্রতিনিধি",
                phone: item.date_iso || "",
                photo: item.file_url || "/images/teachers/default_avatar.png",
                term: extra.term || "২০২৪ - ২০২৬",
                bio: extra.bio || "",
              };
            } catch (e) {
              return null;
            }
          })
          .filter(Boolean);
      }
    } catch (e) {}

    const dbIds = new Set(dbMembers.map((m) => String(m.id)));
    const merged = [...dbMembers, ...localMembers.filter((m: any) => !dbIds.has(String(m.id)))];

    return NextResponse.json({ success: true, members: merged });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const members = await getCommitteeData();

    if (body.id) {
      // Edit existing
      const cleanId = String(body.id).replace("mc-", "");
      const numId = Number(cleanId);
      if (!isNaN(numId)) {
        try {
          await supabase
            .from("notices")
            .update({
              title: body.name,
              date: body.designation,
              date_iso: body.phone || "",
              file_url: body.photo || "",
              added_by: JSON.stringify({
                nameEn: body.nameEn,
                designationEn: body.designationEn,
                category: body.category,
                term: body.term,
                bio: body.bio,
              }),
            })
            .eq("id", numId)
            .eq("type", "committee");
        } catch (e) {}
      }

      const index = members.findIndex((m: any) => m.id === body.id);
      if (index !== -1) {
        members[index] = { ...members[index], ...body };
        await saveCommitteeData(members);
        return NextResponse.json({ success: true, member: members[index] });
      }
      return NextResponse.json({ success: true, member: body });
    }

    // Add new
    const numId = Date.now() % 2147483647;
    const newMember = {
      id: body.id || `mc-${numId}`,
      name: body.name,
      nameEn: body.nameEn || body.name,
      designation: body.designation,
      designationEn: body.designationEn || body.designation,
      category: body.category || "অভিভাবক প্রতিনিধি",
      phone: body.phone || "",
      photo: body.photo || "/images/teachers/default_avatar.png",
      term: body.term || "২০২৪ - ২০২৬",
      bio: body.bio || "",
    };

    try {
      await supabase.from("notices").insert({
        id: numId,
        title: newMember.name,
        date: newMember.designation,
        date_iso: newMember.phone,
        file_url: newMember.photo,
        type: "committee",
        added_by: JSON.stringify({
          nameEn: newMember.nameEn,
          designationEn: newMember.designationEn,
          category: newMember.category,
          term: newMember.term,
          bio: newMember.bio,
        }),
        is_new: false,
      });
    } catch (e) {
      console.error("Supabase committee insert error:", e);
    }

    const updated = [...members, newMember];
    await saveCommitteeData(updated);

    return NextResponse.json({ success: true, member: newMember, members: updated });
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

    const cleanId = String(id).replace("mc-", "");
    const numId = Number(cleanId);
    if (!isNaN(numId)) {
      try {
        await supabase.from("notices").delete().eq("id", numId).eq("type", "committee");
      } catch (e) {}
    }

    const members = await getCommitteeData();
    const filtered = members.filter((m: any) => m.id !== id);
    await saveCommitteeData(filtered);

    return NextResponse.json({ success: true, members: filtered });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
