import { NextResponse } from "next/server";
import { readFile, writeFile } from "fs/promises";
import path from "path";

const resultsFilePath = path.join(process.cwd(), "src", "data", "results.json");

async function getResultsFromFile(): Promise<any[]> {
  try {
    const data = await readFile(resultsFilePath, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

async function saveResultsToFile(results: any[]) {
  await writeFile(resultsFilePath, JSON.stringify(results, null, 2), "utf-8");
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const cls = searchParams.get("class");
    const roll = searchParams.get("roll");
    const exam = searchParams.get("exam");
    const year = searchParams.get("year");

    let results = await getResultsFromFile();

    if (cls) {
      results = results.filter((r) => String(r.class) === String(cls));
    }
    if (roll) {
      results = results.filter((r) => String(r.roll).trim() === String(roll).trim());
    }
    if (exam) {
      results = results.filter((r) => r.exam === exam);
    }
    if (year) {
      results = results.filter((r) => String(r.year) === String(year));
    }

    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const existing = await getResultsFromFile();

    if (Array.isArray(body)) {
      // Bulk insert
      const newItems = body.map((item, index) => ({
        id: item.id || `res-${Date.now()}-${index}`,
        ...item,
      }));
      const merged = [...existing, ...newItems];
      await saveResultsToFile(merged);
      return NextResponse.json({ success: true, count: newItems.length, results: merged });
    } else {
      // Single insert
      const newItem = {
        id: body.id || `res-${Date.now()}`,
        ...body,
      };
      const merged = [newItem, ...existing];
      await saveResultsToFile(merged);
      return NextResponse.json({ success: true, result: newItem });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const id = body.id;
    if (!id) {
      return NextResponse.json({ error: "Missing result id" }, { status: 400 });
    }
    const existing = await getResultsFromFile();
    const index = existing.findIndex((r) => r.id === id);
    if (index === -1) {
      return NextResponse.json({ error: "Result not found" }, { status: 404 });
    }
    existing[index] = { ...existing[index], ...body };
    await saveResultsToFile(existing);
    return NextResponse.json({ success: true, result: existing[index] });
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
      return NextResponse.json({ error: "Missing result id" }, { status: 400 });
    }

    const existing = await getResultsFromFile();
    const filtered = existing.filter((r) => r.id !== id);
    await saveResultsToFile(filtered);

    return NextResponse.json({ success: true, remaining: filtered.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
