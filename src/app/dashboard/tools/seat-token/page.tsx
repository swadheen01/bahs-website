"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { FaArrowLeft, FaChair, FaDownload, FaFileExcel, FaFilePdf, FaExclamationTriangle, FaCheckCircle } from "react-icons/fa";
import { parseSeatPlanRows, buildImagePdf, dataUrlToBytes, type SeatStudent } from "@/lib/seatToken";
import { SeatTokenPage, LAYOUTS, type SeatLayout, type TokenOptions } from "@/components/tools/SeatTokenSheet";

// Heavy libraries are loaded only when a file is processed (not on page load).
const loadXLSX = () => import("xlsx");
const loadHtmlToImage = () => import("html-to-image");

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const MAX_STUDENTS = 3000;
const ALL_SHEETS = "__all__";

type SheetData = { name: string; rows: unknown[][] };

export default function SeatTokenToolPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [sheets, setSheets] = useState<SheetData[]>([]);
  const [sheetChoice, setSheetChoice] = useState<string>(ALL_SHEETS);
  const [fileName, setFileName] = useState("");
  const [fileError, setFileError] = useState("");
  const [layout, setLayout] = useState<SeatLayout>(6);
  const [options, setOptions] = useState<TokenOptions>({
    schoolName: "বানিয়াচং আদর্শ উচ্চ বিদ্যালয়",
    examTitle: "",
    banglaDigits: true,
  });
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [resultMsg, setResultMsg] = useState("");
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!loading && (!user || (user.role !== "admin" && user.role !== "teacher"))) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  const parsed = useMemo(() => {
    if (!sheets.length) return null;
    const chosen = sheetChoice === ALL_SHEETS ? sheets : sheets.filter((s) => s.name === sheetChoice);
    const students: SeatStudent[] = [];
    const missing = new Set<string>();
    let skipped = 0;
    let usableSheets = 0;
    for (const sheet of chosen) {
      const r = parseSeatPlanRows(sheet.rows);
      if (r.missingColumns.length) {
        // Ignore extra sheets without a seat-plan table (e.g. an instructions sheet) when using all sheets.
        if (sheetChoice !== ALL_SHEETS || chosen.length === 1) r.missingColumns.forEach((m) => missing.add(m));
        continue;
      }
      usableSheets++;
      students.push(...r.students);
      skipped += r.skippedRows;
    }
    if (!usableSheets && !missing.size) ["শিক্ষার্থীর নাম", "শ্রেণী", "রোল"].forEach((m) => missing.add(m));
    const incomplete = students.filter((s) => !s.name || !s.roll || !s.className).length;
    return { students: students.slice(0, MAX_STUDENTS), tooMany: students.length > MAX_STUDENTS, missing: [...missing], skipped, incomplete };
  }, [sheets, sheetChoice]);

  const pages = useMemo(() => {
    const list = parsed?.students ?? [];
    const out: SeatStudent[][] = [];
    for (let i = 0; i < list.length; i += layout) out.push(list.slice(i, i + layout));
    return out;
  }, [parsed, layout]);

  const handleFile = async (file: File | undefined) => {
    setFileError("");
    setResultMsg("");
    setSheets([]);
    if (!file) return;
    if (file.size > MAX_FILE_BYTES) {
      setFileError("ফাইলটি অনেক বড় (সর্বোচ্চ ৫ MB)।");
      return;
    }
    try {
      const XLSX = await loadXLSX();
      const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
      const data: SheetData[] = workbook.SheetNames.map((name) => ({
        name,
        rows: XLSX.utils.sheet_to_json<unknown[]>(workbook.Sheets[name], { header: 1, defval: "", raw: false, blankrows: false }),
      }));
      setFileName(file.name);
      setSheetChoice(ALL_SHEETS);
      setSheets(data);
    } catch {
      setFileError("ফাইলটি পড়া যায়নি। অনুগ্রহ করে সঠিক Excel (.xlsx / .xls) বা CSV ফাইল দিন।");
    }
  };

  const generatePdf = async () => {
    if (!pages.length || progress) return;
    setResultMsg("");
    setProgress({ done: 0, total: pages.length });
    try {
      const { toJpeg, getFontEmbedCSS } = await loadHtmlToImage();
      if ("fonts" in document) await document.fonts.ready.catch(() => {});
      const L = LAYOUTS[layout];
      const first = pageRefs.current[0];
      let fontEmbedCSS: string | undefined;
      try {
        // Embed the Bangla font once and reuse it for every page (much faster than per page).
        if (first) fontEmbedCSS = await getFontEmbedCSS(first);
      } catch {
        fontEmbedCSS = undefined;
      }

      const images: { jpeg: Uint8Array; landscape: boolean }[] = [];
      for (let i = 0; i < pages.length; i++) {
        const node = pageRefs.current[i];
        if (!node) continue;
        const dataUrl = await toJpeg(node, {
          quality: 0.85,
          pixelRatio: 2,
          backgroundColor: "#ffffff",
          width: L.width,
          height: L.height,
          cacheBust: false,
          ...(fontEmbedCSS ? { fontEmbedCSS } : { skipFonts: true }),
        });
        images.push({ jpeg: dataUrlToBytes(dataUrl), landscape: L.landscape });
        setProgress({ done: i + 1, total: pages.length });
      }

      const blob = buildImagePdf(images);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const base = fileName.replace(/\.[^.]+$/, "") || "seat-plan";
      a.href = url;
      a.download = `${base}_seat_tokens.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
      setResultMsg(`PDF তৈরি হয়েছে: ${images.length} পৃষ্ঠা, ${parsed?.students.length ?? 0}টি টোকেন।`);
    } catch (err) {
      console.error(err);
      setFileError("PDF তৈরি করা যায়নি। পৃষ্ঠাটি রিফ্রেশ করে আবার চেষ্টা করুন।");
    } finally {
      setProgress(null);
    }
  };

  if (loading || !user || (user.role !== "admin" && user.role !== "teacher")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 font-bengali text-lg">লোড হচ্ছে...</p>
      </div>
    );
  }

  const L = LAYOUTS[layout];
  const previewScale = L.landscape ? 0.5 : 0.48;
  const ready = !!parsed && !parsed.missing.length && pages.length > 0;

  return (
    <div className="min-h-screen bg-gray-100 font-bengali">
      <header className="bg-[#051939] text-white px-6 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
            <FaChair size={18} className="text-yellow-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold">আসন বিন্যাস টোকেন তৈরি</h1>
            <p className="text-xs text-gray-300">Excel ফাইল থেকে প্রিন্টযোগ্য PDF টোকেন</p>
          </div>
        </div>
        <Link href="/dashboard/tools" className="bg-white/10 hover:bg-white/20 text-xs px-3 py-2 rounded-lg flex items-center gap-1">
          <FaArrowLeft /> টুলস
        </Link>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl space-y-6">
        {/* Step 1 */}
        <section className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-[#051939] mb-1">১. Excel ফাইল নির্বাচন করুন</h2>
          <p className="text-sm text-gray-600 mb-4">
            ফাইলে এই কলামগুলো থাকতে হবে: <b>শিক্ষার্থীর নাম</b>, <b>শ্রেণী</b>, <b>রোল</b> (আবশ্যক) এবং <b>শাখা</b>, <b>পরীক্ষার হল</b>{" "}
            (ঐচ্ছিক)। ইংরেজি শিরোনামও চলবে (Name, Class, Section, Roll, Hall)। একাধিক শিট থাকলে সব শিটের শিক্ষার্থী একসাথে নেওয়া হবে।
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <label className="cursor-pointer bg-[#06874A] hover:bg-[#056b3b] text-white px-4 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm">
              <FaFileExcel /> ফাইল আপলোড করুন
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={(e) => {
                  handleFile(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
            </label>
            <a
              href="/downloads/seat-plan-demo.xlsx"
              download
              className="border border-[#06874A] text-[#06874A] hover:bg-green-50 px-4 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2"
            >
              <FaDownload /> ডেমো Excel ফাইল ডাউনলোড
            </a>
            {fileName && <span className="text-sm text-gray-700">ফাইল: <b>{fileName}</b></span>}
          </div>
          <p className="text-xs text-gray-500 mt-3">🔒 ফাইলটি কোথাও আপলোড হয় না, আপনার ব্রাউজারেই প্রক্রিয়া করা হয়।</p>

          {fileError && (
            <div role="alert" className="mt-4 bg-red-50 border border-red-300 rounded-lg p-3 flex items-start gap-2 text-sm text-red-900 font-bold">
              <FaExclamationTriangle className="mt-0.5 shrink-0" /> {fileError}
            </div>
          )}
          {parsed?.missing.length ? (
            <div role="alert" className="mt-4 bg-red-50 border border-red-300 rounded-lg p-3 text-sm text-red-900">
              <p className="font-bold flex items-center gap-2">
                <FaExclamationTriangle /> এই কলামগুলো পাওয়া যায়নি: {parsed.missing.join(", ")}
              </p>
              <p className="mt-1">প্রথম সারিতে কলামের শিরোনাম দিন (ডেমো ফাইলটি দেখুন)।</p>
            </div>
          ) : null}
        </section>

        {/* Step 2 */}
        {sheets.length > 0 && (
          <section className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-[#051939] mb-4">২. টোকেনের সেটিংস</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">বিদ্যালয়ের নাম</label>
                <input
                  type="text"
                  value={options.schoolName}
                  onChange={(e) => setOptions({ ...options, schoolName: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">পরীক্ষার নাম (ঐচ্ছিক)</label>
                <input
                  type="text"
                  value={options.examTitle}
                  placeholder="যেমন: বার্ষিক পরীক্ষা - ২০২৬"
                  onChange={(e) => setOptions({ ...options, examTitle: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <span className="block text-sm font-bold text-gray-700 mb-1">প্রতি পৃষ্ঠায় টোকেন</span>
                <div className="flex gap-2">
                  {([6, 4] as SeatLayout[]).map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setLayout(n)}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-bold border ${
                        layout === n ? "bg-[#051939] text-white border-[#051939]" : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      {n === 6 ? "৬টি (A4 খাড়া)" : "৪টি বড় (A4 আড়াআড়ি)"}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-3">
                {sheets.length > 1 && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">শিট</label>
                    <select
                      value={sheetChoice}
                      onChange={(e) => setSheetChoice(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
                    >
                      <option value={ALL_SHEETS}>সব শিট একসাথে</option>
                      {sheets.map((s) => (
                        <option key={s.name} value={s.name}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <label className="flex items-center gap-2 text-sm text-gray-700 font-bold">
                  <input
                    type="checkbox"
                    checked={options.banglaDigits}
                    onChange={(e) => setOptions({ ...options, banglaDigits: e.target.checked })}
                    className="w-4 h-4"
                  />
                  সংখ্যা বাংলায় দেখান (12 → ১২)
                </label>
              </div>
            </div>
          </section>
        )}

        {/* Step 3 */}
        {ready && parsed && (
          <section className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="text-lg font-bold text-[#051939]">৩. প্রিভিউ ও PDF ডাউনলোড</h2>
                <p className="text-sm text-gray-600 mt-1">
                  মোট <b>{parsed.students.length}</b> জন শিক্ষার্থী, <b>{pages.length}</b> পৃষ্ঠা।
                  {parsed.skipped > 0 && ` ${parsed.skipped}টি অসম্পূর্ণ সারি বাদ দেওয়া হয়েছে।`}
                </p>
                {parsed.incomplete > 0 && (
                  <p className="text-xs text-amber-700 font-bold mt-1">
                    ⚠️ {parsed.incomplete}জন শিক্ষার্থীর নাম, শ্রেণী বা রোল খালি আছে: প্রিভিউতে দেখে নিন।
                  </p>
                )}
                {parsed.tooMany && (
                  <p className="text-xs text-amber-700 font-bold mt-1">⚠️ একবারে সর্বোচ্চ {MAX_STUDENTS} জন। ফাইলটি ভাগ করে নিন।</p>
                )}
              </div>
              <button
                type="button"
                onClick={generatePdf}
                disabled={!!progress}
                className="bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white px-5 py-3 rounded-lg text-sm font-bold flex items-center gap-2 shadow"
              >
                <FaFilePdf />
                {progress ? `তৈরি হচ্ছে... ${progress.done}/${progress.total} পৃষ্ঠা` : "PDF তৈরি ও ডাউনলোড করুন"}
              </button>
            </div>

            {progress && (
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4 overflow-hidden">
                <div className="bg-red-600 h-2 transition-all" style={{ width: `${(progress.done / progress.total) * 100}%` }} />
              </div>
            )}
            {resultMsg && (
              <div role="status" className="mb-4 bg-green-50 border border-green-300 rounded-lg p-3 flex items-center gap-2 text-sm text-green-900 font-bold">
                <FaCheckCircle /> {resultMsg} প্রিন্ট করার সময় &quot;Actual size / 100%&quot; নির্বাচন করুন।
              </div>
            )}

            <div className="bg-gray-200 rounded-lg p-4 overflow-x-auto">
              <div className="flex flex-col items-center gap-4">
                {pages.map((group, i) => (
                  <div key={`${layout}-${i}`} className="flex flex-col items-center gap-1">
                    <div
                      className="shadow-lg bg-white overflow-hidden shrink-0"
                      style={{ width: L.width * previewScale, height: L.height * previewScale }}
                    >
                      <div style={{ transform: `scale(${previewScale})`, transformOrigin: "top left", width: L.width, height: L.height }}>
                        <SeatTokenPage
                          ref={(el) => {
                            pageRefs.current[i] = el;
                          }}
                          students={group}
                          layout={layout}
                          options={options}
                        />
                      </div>
                    </div>
                    <span className="text-xs text-gray-600">পৃষ্ঠা {i + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
