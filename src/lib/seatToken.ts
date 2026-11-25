/**
 * Seat-plan token helpers (runs entirely in the browser: no server CPU on Cloudflare).
 * - parseSeatPlanRows(): turns spreadsheet rows into students, matching Bangla or English headers.
 * - buildImagePdf(): writes a minimal PDF where each page is one full-page JPEG.
 *   (Bangla text is rendered by the browser into the image, so conjuncts always look right.)
 */

export interface SeatStudent {
  name: string;
  className: string;
  section: string;
  roll: string;
  hall: string;
}

export type SeatField = keyof SeatStudent;

export const SEAT_FIELDS: { key: SeatField; label: string; required: boolean }[] = [
  { key: "name", label: "শিক্ষার্থীর নাম", required: true },
  { key: "className", label: "শ্রেণী", required: true },
  { key: "section", label: "শাখা", required: false },
  { key: "roll", label: "রোল", required: true },
  { key: "hall", label: "পরীক্ষার হল", required: false },
];

// Normalized header names (lowercase, no spaces/punctuation) accepted for each field.
const HEADER_SYNONYMS: Record<SeatField, string[]> = {
  name: ["শিক্ষার্থীরনাম", "শিক্ষার্থীনাম", "ছাত্রছাত্রীরনাম", "ছাত্রছাত্রীনাম", "পরীক্ষার্থীরনাম", "নাম", "name", "studentname", "studentsname", "fullname"],
  className: ["শ্রেণী", "শ্রেণি", "শ্রেনী", "শ্রেনি", "ক্লাস", "class", "classname"],
  section: ["শাখা", "সেকশন", "বিভাগ", "গ্রুপ", "section", "group", "shift"],
  roll: ["রোল", "রোলনং", "রোলনম্বর", "ক্রমিকরোল", "roll", "rollno", "rollnumber"],
  hall: ["পরীক্ষারহল", "এক্সামহল", "হল", "হলনং", "কক্ষ", "কক্ষনং", "রুম", "রুমনং", "hall", "examhall", "hallno", "room", "roomno"],
};

const normalizeHeader = (value: unknown) =>
  String(value ?? "")
    .toLowerCase()
    .replace(/[\s:：.\-_()\[\]/#।]+/g, "");

function matchHeader(cell: unknown): SeatField | null {
  const h = normalizeHeader(cell);
  if (!h) return null;
  const fields = Object.keys(HEADER_SYNONYMS) as SeatField[];
  for (const f of fields) if (HEADER_SYNONYMS[f].includes(h)) return f;
  // Looser match, e.g. "শিক্ষার্থীর পূর্ণ নাম" or "Exam Hall Name".
  for (const f of fields) if (HEADER_SYNONYMS[f].some((s) => s.length >= 2 && h.includes(s))) return f;
  return null;
}

const cellText = (value: unknown) => {
  if (value === null || value === undefined) return "";
  if (typeof value === "number") return Number.isInteger(value) ? String(value) : String(value);
  return String(value).replace(/\s+/g, " ").trim();
};

export interface ParseResult {
  students: SeatStudent[];
  missingColumns: string[]; // required columns that were not found
  skippedRows: number; // empty or incomplete rows that were ignored
}

/** rows = sheet_to_json(sheet, { header: 1 }) output (array of arrays). */
export function parseSeatPlanRows(rows: unknown[][]): ParseResult {
  // Find the header row: the row (within the first 15) that matches the most known column names.
  let headerIndex = -1;
  let columnMap: Partial<Record<SeatField, number>> = {};
  let bestScore = 0;
  for (let r = 0; r < Math.min(rows.length, 15); r++) {
    const map: Partial<Record<SeatField, number>> = {};
    (rows[r] || []).forEach((cell, c) => {
      const f = matchHeader(cell);
      if (f && map[f] === undefined) map[f] = c;
    });
    const score = Object.keys(map).length;
    if (score > bestScore) {
      bestScore = score;
      headerIndex = r;
      columnMap = map;
    }
  }

  const missingColumns = SEAT_FIELDS.filter((f) => f.required && columnMap[f.key] === undefined).map((f) => f.label);
  if (headerIndex < 0 || bestScore < 2 || missingColumns.length) {
    return {
      students: [],
      missingColumns: missingColumns.length ? missingColumns : SEAT_FIELDS.filter((f) => f.required).map((f) => f.label),
      skippedRows: 0,
    };
  }

  const students: SeatStudent[] = [];
  let skippedRows = 0;
  for (let r = headerIndex + 1; r < rows.length; r++) {
    const row = rows[r] || [];
    const get = (f: SeatField) => (columnMap[f] === undefined ? "" : cellText(row[columnMap[f] as number]));
    const s: SeatStudent = {
      name: get("name"),
      className: get("className"),
      section: get("section"),
      roll: get("roll"),
      hall: get("hall"),
    };
    if (!s.name && !s.roll) {
      if (row.some((v) => cellText(v))) skippedRows++;
      continue;
    }
    students.push(s);
  }
  return { students, missingColumns: [], skippedRows };
}

const BN_DIGITS = "০১২৩৪৫৬৭৮৯";
export const toBanglaDigits = (value: string) => value.replace(/[0-9]/g, (d) => BN_DIGITS[Number(d)]);

/* ------------------------------------------------------------------ */
/* Minimal image-only PDF writer                                       */
/* ------------------------------------------------------------------ */

export interface PdfImagePage {
  jpeg: Uint8Array;
  landscape: boolean;
}

export function dataUrlToBytes(dataUrl: string): Uint8Array {
  const base64 = dataUrl.slice(dataUrl.indexOf(",") + 1);
  const bin = atob(base64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

/** Reads width/height from the JPEG SOF marker. */
function jpegSize(bytes: Uint8Array): { width: number; height: number } {
  let i = 2;
  while (i + 9 < bytes.length) {
    if (bytes[i] !== 0xff) {
      i++;
      continue;
    }
    const marker = bytes[i + 1];
    const length = (bytes[i + 2] << 8) | bytes[i + 3];
    // SOF0..SOF15, except DHT (C4), JPG (C8) and DAC (CC)
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      return { height: (bytes[i + 5] << 8) | bytes[i + 6], width: (bytes[i + 7] << 8) | bytes[i + 8] };
    }
    i += 2 + length;
  }
  throw new Error("Invalid JPEG");
}

const A4_W = 595.28;
const A4_H = 841.89;

/** Builds an A4 PDF; each page shows one JPEG stretched to the full page. */
export function buildImagePdf(pages: PdfImagePage[]): Blob {
  const enc = new TextEncoder();
  const chunks: Uint8Array[] = [];
  const offsets: number[] = [];
  let length = 0;
  const push = (data: string | Uint8Array) => {
    const bytes = typeof data === "string" ? enc.encode(data) : data;
    chunks.push(bytes);
    length += bytes.length;
  };
  const obj = (num: number, parts: (string | Uint8Array)[]) => {
    offsets[num] = length;
    push(`${num} 0 obj\n`);
    parts.forEach(push);
    push("\nendobj\n");
  };

  push("%PDF-1.4\n%âãÏÓ\n");
  obj(1, ["<< /Type /Catalog /Pages 2 0 R >>"]);
  const kids = pages.map((_, i) => `${3 + i * 3} 0 R`).join(" ");
  obj(2, [`<< /Type /Pages /Kids [${kids}] /Count ${pages.length} >>`]);

  pages.forEach((page, i) => {
    const w = page.landscape ? A4_H : A4_W;
    const h = page.landscape ? A4_W : A4_H;
    const pageNum = 3 + i * 3;
    const { width, height } = jpegSize(page.jpeg);
    const content = `q ${w} 0 0 ${h} 0 0 cm /Im${i} Do Q`;
    obj(pageNum, [
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${w} ${h}] /Resources << /XObject << /Im${i} ${pageNum + 2} 0 R >> >> /Contents ${pageNum + 1} 0 R >>`,
    ]);
    obj(pageNum + 1, [`<< /Length ${content.length} >>\nstream\n${content}\nendstream`]);
    obj(pageNum + 2, [
      `<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${page.jpeg.length} >>\nstream\n`,
      page.jpeg,
      "\nendstream",
    ]);
  });

  const total = 3 + pages.length * 3;
  const xref = length;
  push(`xref\n0 ${total}\n0000000000 65535 f \n`);
  for (let n = 1; n < total; n++) push(`${String(offsets[n]).padStart(10, "0")} 00000 n \n`);
  push(`trailer\n<< /Size ${total} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`);
  return new Blob(chunks as BlobPart[], { type: "application/pdf" });
}
