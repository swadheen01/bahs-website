import { NextResponse } from "next/server";
import { readFile, writeFile } from "fs/promises";
import path from "path";

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
  await writeFile(committeeFilePath, JSON.stringify(data, null, 2), "utf-8");
}

export async function GET() {
  try {
    const members = await getCommitteeData();
    return NextResponse.json({ success: true, members });
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
      const index = members.findIndex((m: any) => m.id === body.id);
      if (index !== -1) {
        members[index] = { ...members[index], ...body };
        await saveCommitteeData(members);
        return NextResponse.json({ success: true, member: members[index] });
      }
    }

    // Add new
    const newMember = {
      id: body.id || `mc-${Date.now()}`,
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

    const members = await getCommitteeData();
    const filtered = members.filter((m: any) => m.id !== id);
    await saveCommitteeData(filtered);

    return NextResponse.json({ success: true, members: filtered });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
