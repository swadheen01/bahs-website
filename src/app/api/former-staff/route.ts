import { NextResponse } from "next/server";
import { readFile, writeFile } from "fs/promises";
import path from "path";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, type IronSessionData } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const dataFilePath = path.join(process.cwd(), "src", "data", "former-staff.json");

async function getData() {
  try {
    const fileData = await readFile(dataFilePath, "utf-8");
    return JSON.parse(fileData);
  } catch (error) {
    return { headmasters: [], teachers: [] };
  }
}

async function saveData(data: any) {
  try {
    await writeFile(dataFilePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (e) {
    console.error("Failed to save", e);
  }
}

export async function GET() {
  const data = await getData();
  try { revalidatePath("/", "layout"); } catch(e) {} return NextResponse.json(data);
}

export async function POST(req: Request) {
  const session = await getIronSession<IronSessionData>(await cookies(), sessionOptions);
  if (!session.user || session.user.role !== "admin") {
    try { revalidatePath("/", "layout"); } catch(e) {} return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const data = await getData();
    
    const isHeadmaster = body.category === "headmaster";
    const collection = isHeadmaster ? data.headmasters : data.teachers;

    if (body.action === "add") {
      const newItem = {
        id: `fs-${Date.now()}`,
        name: body.name,
        nameEn: body.nameEn || body.name,
        designation: body.designation,
        designationEn: body.designationEn || body.designation,
        tenure: body.tenure,
        photo: body.photo || "/images/teachers/default_avatar.png"
      };
      collection.push(newItem);
      await saveData(data);
      try { revalidatePath("/", "layout"); } catch(e) {} return NextResponse.json({ success: true, item: newItem });
    }

    if (body.action === "edit") {
      const index = collection.findIndex((item: any) => item.id === body.id);
      if (index > -1) {
        collection[index] = {
          ...collection[index],
          name: body.name,
          nameEn: body.nameEn || body.name,
          designation: body.designation,
          designationEn: body.designationEn || body.designation,
          tenure: body.tenure,
          photo: body.photo || collection[index].photo
        };
        await saveData(data);
        try { revalidatePath("/", "layout"); } catch(e) {} return NextResponse.json({ success: true, item: collection[index] });
      }
      try { revalidatePath("/", "layout"); } catch(e) {} return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (body.action === "delete") {
      if (isHeadmaster) {
        data.headmasters = data.headmasters.filter((item: any) => item.id !== body.id);
      } else {
        data.teachers = data.teachers.filter((item: any) => item.id !== body.id);
      }
      await saveData(data);
      try { revalidatePath("/", "layout"); } catch(e) {} return NextResponse.json({ success: true });
    }

    try { revalidatePath("/", "layout"); } catch(e) {} return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    try { revalidatePath("/", "layout"); } catch(e) {} return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
