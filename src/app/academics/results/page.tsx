"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  FaGraduationCap,
  FaSearch,
  FaPrint,
  FaCheckCircle,
  FaTimesCircle,
  FaExternalLinkAlt,
  FaInfoCircle,
  FaAward,
  FaSchool,
  FaIdCard,
  FaFileAlt,
  FaArrowRight,
  FaRedo,
  FaCopy,
  FaCheck,
  FaUndo,
} from "react-icons/fa";
import { useLanguage } from "@/lib/LanguageContext";

const SUBJECT_MAP: Record<string, string> = {
  "101": "বাংলা (Bangla)",
  "102": "বাংলা ২য় পত্র (Bangla II)",
  "107": "ইংরেজি (English)",
  "108": "ইংরেজি ২য় পত্র (English II)",
  "109": "গণিত (Mathematics)",
  "111": "ইসলাম ও নৈতিক শিক্ষা (Islam & Moral Edu)",
  "112": "হিন্দুধর্ম ও নৈতিক শিক্ষা (Hindu Religion)",
  "114": "বৌদ্ধধর্ম (Buddhist Religion)",
  "115": "খ্রিষ্টধর্ম (Christian Religion)",
  "127": "বিজ্ঞান (General Science)",
  "136": "পদার্থবিজ্ঞান (Physics)",
  "137": "রসায়ন (Chemistry)",
  "138": "জীববিজ্ঞান (Biology)",
  "145": "উচ্চতর গণিত (Higher Mathematics)",
  "154": "তথ্য ও যোগাযোগ প্রযুক্তি (ICT)",
  "150": "বাংলাদেশ ও বিশ্বপরিচয় (BGS)",
  "147": "শারীরিক শিক্ষা ও স্বাস্থ্য (Physical Edu)",
  "156": "কর্ম ও জীবনমুখী শিক্ষা (Career Edu)",
  "134": "কৃষি শিক্ষা (Agriculture Studies)",
  "135": "গার্হস্থ্য বিজ্ঞান (Home Science)",
  "141": "হিসাববিজ্ঞান (Accounting)",
  "143": "ব্যবসায় উদ্যোগ (Business Ent.)",
  "140": "ফিন্যান্স ও ব্যাংকিং (Finance & Banking)",
  "126": "ভূগোল ও পরিবেশ (Geography)",
  "153": "পৌরনীতি ও নাগরিকতা (Civics)",
  "152": "ইতিহাস (History)",
  "129": "চারু ও কারুকলা (Arts & Crafts)",
};

export default function ResultsPage() {
  const { t, language } = useLanguage();

  const [activeTab, setActiveTab] = useState<"internal" | "board">("board");

  // Board result search state (Native direct integration without iframe)
  const [boardExam, setBoardExam] = useState<string>("ssc");
  const [boardYear, setBoardYear] = useState<string>("2024");
  const [boardName, setBoardName] = useState<string>("sylhet");
  const [boardRoll, setBoardRoll] = useState<string>("");
  const [boardReg, setBoardReg] = useState<string>("");
  const [boardCaptchaInput, setBoardCaptchaInput] = useState<string>("");

  const [boardCaptchaImg, setBoardCaptchaImg] = useState<string>("");
  const [boardSessionToken, setBoardSessionToken] = useState<string>("");
  const [loadingCaptcha, setLoadingCaptcha] = useState<boolean>(false);
  const [boardSearching, setBoardSearching] = useState<boolean>(false);
  const [boardError, setBoardError] = useState<string | null>(null);
  const [boardResultData, setBoardResultData] = useState<any | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (e) {
      // Ignore
    }
  };

  const fetchBoardCaptcha = async (keepError = false) => {
    setLoadingCaptcha(true);
    if (!keepError) {
      setBoardError(null);
    }
    try {
      const res = await fetch("/api/board-results");
      const data = await res.json();
      if (data.success && data.captcha) {
        setBoardCaptchaImg(data.captcha);
        setBoardSessionToken(data.sessionToken);
      } else {
        setBoardError(data.message || "ক্যাপচা লোড করা যায়নি, আবার চেষ্টা করুন");
      }
    } catch {
      setBoardError("বোর্ড সার্ভারের সাথে সংযোগে ত্রুটি হয়েছে");
    } finally {
      setLoadingCaptcha(false);
    }
  };

  useEffect(() => {
    if (activeTab === "board" && !boardCaptchaImg && !boardSearching) {
      fetchBoardCaptcha(false);
    }
  }, [activeTab]);

  const handleBoardSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!boardRoll.trim()) {
      alert("অনুগ্রহ করে রোল নম্বর প্রদান করুন");
      return;
    }
    if (!boardCaptchaInput.trim()) {
      alert("অনুগ্রহ করে ৪-সংখ্যার সিকিউরিটি ক্যাপচা কোডটি পূরণ করুন");
      return;
    }

    setBoardSearching(true);
    setBoardError(null);
    setBoardResultData(null);

    try {
      const res = await fetch("/api/board-results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionToken: boardSessionToken,
          exam: boardExam,
          year: boardYear,
          board: boardName,
          roll: boardRoll.trim(),
          reg: boardReg.trim(),
          captcha: boardCaptchaInput.trim(),
        }),
      });

      const data = await res.json();
      if (data.success && data.result) {
        setBoardResultData(data.result);
        setBoardError(null);
      } else {
        setBoardError(data.message || "ফলাফল পাওয়া যায়নি");
        fetchBoardCaptcha(true);
        setBoardCaptchaInput("");
      }
    } catch {
      setBoardError("বোর্ড ফলাফল অনুসন্ধান করতে সমস্যা হয়েছে। অনুগ্রহ করে সরাসরি সরকারি পোর্টালে চেষ্টা করুন।");
      fetchBoardCaptcha(true);
    } finally {
      setBoardSearching(false);
    }
  };

  const handleResetBoard = () => {
    setBoardResultData(null);
    setBoardError(null);
    setBoardRoll("");
    setBoardReg("");
    setBoardCaptchaInput("");
    fetchBoardCaptcha(false);
  };

  // Search state
  const [selectedClass, setSelectedClass] = useState("6");
  const [selectedExam, setSelectedExam] = useState("বার্ষিক পরীক্ষা");
  const [selectedYear, setSelectedYear] = useState("2026");
  const [rollInput, setRollInput] = useState("");

  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [resultData, setResultData] = useState<any | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rollInput.trim()) {
      alert("অনুগ্রহ করে রোল নম্বর দিন");
      return;
    }
    setSearching(true);
    setSearched(true);
    try {
      const query = new URLSearchParams({
        class: selectedClass,
        roll: rollInput.trim(),
        exam: selectedExam,
        year: selectedYear,
      });
      const res = await fetch(`/api/results?${query.toString()}`);
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        setResultData(data.results[0]);
      } else {
        setResultData(null);
      }
    } catch (err) {
      console.error(err);
      setResultData(null);
    }
    setSearching(false);
  };

  const printElement = (elementId: string, docTitle: string) => {
    const element = document.getElementById(elementId);
    if (!element) return;

    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "none";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) return;

    const styles = Array.from(document.querySelectorAll("link[rel='stylesheet'], style"))
      .map((s) => s.outerHTML)
      .join("\n");

    const clone = element.cloneNode(true) as HTMLElement;
    clone.querySelectorAll(".no-print").forEach((el) => el.remove());

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html lang="bn">
        <head>
          <meta charset="utf-8" />
          <title>${docTitle}</title>
          ${styles}
          <style>
            @page {
              size: A4 portrait;
              margin: 10mm 12mm;
            }
            *, *::before, *::after {
              box-sizing: border-box;
            }
            html, body {
              background: #ffffff !important;
              margin: 0 !important;
              padding: 0 !important;
              font-size: 13px !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .no-print {
              display: none !important;
            }
            /* Generous, clean single A4 page fit */
            #printable-board-card, #printable-internal-card {
              padding: 24px 28px !important;
              margin: 0 auto !important;
              border: 2px solid #06874A !important;
              box-shadow: none !important;
              border-radius: 20px !important;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
            .space-y-6 > * + * {
              margin-top: 14px !important;
            }
            .space-y-3 > * + * {
              margin-top: 10px !important;
            }
            table th, table td {
              padding-top: 6px !important;
              padding-bottom: 6px !important;
              padding-left: 14px !important;
              padding-right: 14px !important;
              font-size: 12.5px !important;
            }
            .grid {
              gap: 10px !important;
            }
            .p-5 {
              padding: 16px !important;
            }
            .pb-5 {
              padding-bottom: 12px !important;
            }
            .mb-4 {
              margin-bottom: 12px !important;
            }
            .pb-4 {
              padding-bottom: 12px !important;
            }
            .truncate {
              overflow: visible !important;
              text-overflow: unset !important;
              white-space: normal !important;
            }
            tr, .grid, .rounded-2xl {
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
          </style>
        </head>
        <body>
          <div>
            ${clone.outerHTML}
          </div>
        </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => {
        try {
          document.body.removeChild(iframe);
        } catch (e) {}
      }, 2000);
    }, 400);
  };

  return (
    <div className={`min-h-screen bg-gray-50 pb-20 ${language === "bn" ? "font-bengali" : "font-sans"}`}>
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#051939] via-[#092b5e] to-[#051939] text-white py-12 shadow-md">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
            <FaGraduationCap size={16} />
            <span>{t("একাডেমিক মূল্যায়ন ও ফলাফল", "Academic Evaluation & Results")}</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">
            {t("পরীক্ষার ফলাফল ও মার্কশিট", "Examination Results & Marksheet")}
          </h1>
          <p className="text-gray-300 text-xs sm:text-sm mt-2 flex items-center gap-2">
            <Link href="/" className="hover:text-yellow-300 transition-colors">
              {t("প্রচ্ছদ", "Home")}
            </Link>
            <span>&rsaquo;</span>
            <span className="text-yellow-300">{t("ফলাফল", "Results")}</span>
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-6 max-w-6xl space-y-8 relative z-10">
        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl p-2 shadow-lg border border-gray-100 flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => setActiveTab("board")}
            className={`flex-1 py-3 px-5 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
              activeTab === "board"
                ? "bg-[#051939] text-white shadow-md"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <FaAward className={activeTab === "board" ? "text-yellow-400" : "text-gray-400"} />
            <span>{t("জাতীয় বোর্ড ফলাফল (৮ম ও ১০ম শ্রেণি - JSC & SSC)", "National Board Results (JSC & SSC)")}</span>
          </button>

          <button
            onClick={() => setActiveTab("internal")}
            className={`flex-1 py-3 px-5 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
              activeTab === "internal"
                ? "bg-[#06874A] text-white shadow-md"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <FaSchool className={activeTab === "internal" ? "text-white" : "text-gray-400"} />
            <span>{t("বিদ্যালয়ের অভ্যন্তরীণ ফলাফল (৬ষ্ঠ-১০ম শ্রেণি)", "School Internal Results (Grades 6-10)")}</span>
          </button>
        </div>

        {/* TAB 1: BOARD RESULTS (JSC & SSC) */}
        {activeTab === "board" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Info Notice Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border-t-4 border-[#051939]">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-5 mb-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#051939] flex items-center gap-2">
                    <FaAward className="text-yellow-500" />
                    {t(
                      "৮ম শ্রেণি (JSC) ও ১০ম শ্রেণি (SSC) বোর্ড ফলাফল",
                      "Grade 8 (JSC) & Grade 10 (SSC) Board Results"
                    )}
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    {t(
                      "মাধ্যমিক ও উচ্চ মাধ্যমিক শিক্ষা বোর্ড, সিলেট এবং শিক্ষা মন্ত্রণালয়ের অফিসিয়াল সার্ভার থেকে সরাসরি ফলাফল দেখুন।",
                      "Lookup official board results published directly by Sylhet Education Board & Ministry of Education."
                    )}
                  </p>
                </div>
                <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full border border-emerald-200">
                  {t("সিলেট শিক্ষা বোর্ড", "Sylhet Board")}
                </span>
              </div>

              {/* School Verification Credentials Box with Quick Copy */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-5 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <h3 className="font-bold text-sm text-[#051939] flex items-center gap-2">
                    <FaInfoCircle className="text-blue-600" />
                    {t("শিক্ষা বোর্ড সার্ভারে অনুসন্ধানের জন্য প্রয়োজনীয় তথ্য", "Information Required for Board Search")}
                  </h3>
                  <span className="text-[11px] text-gray-500 font-medium">
                    {t("ক্লিক করে তথ্য কপি করে নিচের ফর্মে পেস্ট করুন", "Click copy button to paste into the form below")}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-white p-3 rounded-xl border border-blue-100 shadow-sm flex items-center justify-between">
                    <div>
                      <span className="text-gray-500 block mb-0.5">{t("শিক্ষা বোর্ড", "Education Board")}</span>
                      <strong className="text-[#051939] text-sm">Sylhet (সিলেট)</strong>
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-blue-100 shadow-sm flex items-center justify-between">
                    <div>
                      <span className="text-gray-500 block mb-0.5">{t("বিদ্যালয় EIIN", "School EIIN")}</span>
                      <strong className="text-[#06874A] text-sm font-mono">129344</strong>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy("129344", "eiin")}
                      className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-md text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                      title="EIIN কপি করুন"
                    >
                      {copiedKey === "eiin" ? <FaCheck size={10} className="text-emerald-600" /> : <FaCopy size={10} />}
                      <span>{copiedKey === "eiin" ? t("কপি হয়েছে!", "Copied!") : t("কপি", "Copy")}</span>
                    </button>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-blue-100 shadow-sm flex items-center justify-between">
                    <div>
                      <span className="text-gray-500 block mb-0.5">{t("বিদ্যালয় / সেন্টার কোড", "School Code")}</span>
                      <strong className="text-purple-700 text-sm font-mono">1903</strong>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy("1903", "center")}
                      className="px-2 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-md text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                      title="সেন্টার কোড কপি করুন"
                    >
                      {copiedKey === "center" ? <FaCheck size={10} className="text-purple-600" /> : <FaCopy size={10} />}
                      <span>{copiedKey === "center" ? t("কপি হয়েছে!", "Copied!") : t("কপি", "Copy")}</span>
                    </button>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-blue-100 shadow-sm">
                    <span className="text-gray-500 block mb-0.5">{t("উপজেলা", "Upazila")}</span>
                    <strong className="text-[#051939] text-sm">{t("বানিয়াচং, হবিগঞ্জ", "Baniyachong, Habiganj")}</strong>
                  </div>
                </div>
              </div>

              {/* NATIVE BOARD RESULTS SEARCH BOX & RESULT DISPLAY */}
              {boardResultData ? (
                /* OFFICIAL MARKSHEET DISPLAY CARD */
                <div id="printable-board-card" className="bg-white rounded-3xl border-2 border-emerald-500 shadow-2xl p-6 sm:p-8 space-y-6 animate-in fade-in duration-300">
                  {/* Marksheet Top Header */}
                  <div className="text-center border-b border-gray-200 pb-5">
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full uppercase tracking-wider">
                      {boardResultData.board_name || "SYLHET"} EDUCATION BOARD
                    </span>
                    <h3 className="text-xl sm:text-2xl font-extrabold text-[#051939] mt-2">
                      {boardExam.toUpperCase()} Examination - {boardYear}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {t("অফিসিয়াল বোর্ড রেজাল্ট ও বিষয়ভিত্তিক গ্রেডশিট", "Official Board Result & Subject-wise Marksheet")}
                    </p>
                  </div>

                  {/* Student Information Summary Grid */}
                  <div className="bg-gradient-to-br from-gray-50 to-emerald-50/30 rounded-2xl border border-gray-200 p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200/80 pb-4 mb-4">
                      <div>
                        <span className="text-xs text-gray-500 block mb-0.5">{t("শিক্ষার্থীর নাম", "Student Name")}</span>
                        <h4 className="text-lg sm:text-xl font-bold text-[#051939]">
                          {boardResultData.name || "N/A"}
                        </h4>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="bg-white px-4 py-2 rounded-xl border border-emerald-300 shadow-sm text-center">
                          <span className="text-[11px] text-gray-500 block">{t("ফলাফল (GPA)", "Result")}</span>
                          <span className="text-base sm:text-lg font-black text-emerald-700">
                            {boardResultData.gpa ? `GPA: ${boardResultData.gpa}` : boardResultData.res_detail || "PASSED"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="bg-white p-3 rounded-xl border border-gray-200/80">
                        <span className="text-gray-500 block mb-0.5">{t("রোল নম্বর", "Roll No")}</span>
                        <strong className="text-gray-900 font-mono text-sm">{boardResultData.roll_no || boardRoll}</strong>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-gray-200/80">
                        <span className="text-gray-500 block mb-0.5">{t("রেজিস্ট্রেশন নম্বর", "Registration No")}</span>
                        <strong className="text-gray-900 font-mono text-sm">{boardResultData.regno || boardReg || "N/A"}</strong>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-gray-200/80">
                        <span className="text-gray-500 block mb-0.5">{t("শিক্ষা বোর্ড", "Board")}</span>
                        <strong className="text-gray-900">{boardResultData.board_name || "Sylhet"}</strong>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-gray-200/80">
                        <span className="text-gray-500 block mb-0.5">{t("বিভাগ / গ্রুপ", "Group")}</span>
                        <strong className="text-gray-900">{boardResultData.stud_group || "N/A"}</strong>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-gray-200/80">
                        <span className="text-gray-500 block mb-0.5">{t("পিতা", "Father's Name")}</span>
                        <strong className="text-gray-900">{boardResultData.fname || "N/A"}</strong>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-gray-200/80">
                        <span className="text-gray-500 block mb-0.5">{t("মাতা", "Mother's Name")}</span>
                        <strong className="text-gray-900">{boardResultData.mname || "N/A"}</strong>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-gray-200/80">
                        <span className="text-gray-500 block mb-0.5">{t("ধরন ও লিঙ্গ", "Type & Gender")}</span>
                        <strong className="text-gray-900">
                          {boardResultData.stud_type || "Regular"} • {boardResultData.stud_sex || "N/A"}
                        </strong>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-gray-200/80">
                        <span className="text-gray-500 block mb-0.5">{t("সেন্টার কোড", "Center / Code")}</span>
                        <strong className="text-gray-900">
                          {boardResultData.centre_name || "Habiganj (1903)"}
                        </strong>
                      </div>
                      <div className="bg-white p-3.5 rounded-xl border border-gray-200/80 col-span-2 sm:col-span-4 flex flex-col items-center justify-center text-center">
                        <span className="text-gray-500 block text-xs mb-1 font-medium">{t("শিক্ষা প্রতিষ্ঠান (Institute)", "Institute")}</span>
                        <strong className="text-[#051939] text-sm sm:text-base font-bold break-words">
                          {boardResultData.inst_name || "Baniyachong Adarsha High School"}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Subject-Wise Grade Table */}
                  {boardResultData.display_details && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-bold text-[#051939] flex items-center gap-2">
                        <FaFileAlt className="text-emerald-600" />
                        <span>{t("বিষয়ভিত্তিক গ্রেড ও ফলাফল", "Subject-wise Grades & Marks")}</span>
                      </h4>
                      <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
                        <table className="w-full text-left text-xs sm:text-sm">
                          <thead className="bg-[#051939] text-white uppercase text-[11px] font-bold">
                            <tr>
                              <th className="py-3 px-4">{t("বিষয় কোড", "Subject Code")}</th>
                              <th className="py-3 px-4">{t("বিষয়ের নাম", "Subject Name")}</th>
                              <th className="py-3 px-4 text-center">{t("প্রাপ্ত গ্রেড / নম্বর", "Grade / Marks")}</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 bg-white">
                            {boardResultData.display_details
                              .split(",")
                              .map((item: string, idx: number) => {
                                const parts = item.split(":");
                                const code = parts[0]?.trim() || "";
                                const gradeStr = parts[1]?.trim() || "";
                                const subParts = gradeStr.split("=");
                                const grade = subParts[subParts.length - 1] || "";
                                const marks = subParts.length > 1 ? subParts[0] : "";
                                const subName = SUBJECT_MAP[code] || `Subject (${code})`;

                                return (
                                  <tr key={idx} className="hover:bg-emerald-50/40 transition">
                                    <td className="py-2.5 px-4 font-mono font-bold text-gray-700">{code}</td>
                                    <td className="py-2.5 px-4 font-medium text-gray-900">{subName}</td>
                                    <td className="py-2.5 px-4 text-center">
                                      <span
                                        className={`inline-block px-3 py-1 rounded-full font-bold text-xs ${
                                          grade === "A+"
                                            ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                            : grade === "F"
                                            ? "bg-red-100 text-red-800 border border-red-300"
                                            : "bg-blue-100 text-blue-800 border border-blue-300"
                                        }`}
                                      >
                                        {marks ? `${marks} (${grade})` : grade}
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Marksheet Actions */}
                  <div className="no-print flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={handleResetBoard}
                      className="px-5 py-2.5 rounded-xl border border-gray-300 hover:bg-gray-100 text-gray-700 font-bold text-xs sm:text-sm transition flex items-center gap-2 cursor-pointer"
                    >
                      <FaUndo size={12} />
                      <span>{t("আরেকটি ফলাফল দেখুন", "Search Another Result")}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => printElement("printable-board-card", `Board_Result_${boardRoll || "Marksheet"}`)}
                      className="px-5 py-2.5 rounded-xl bg-[#06874A] hover:bg-green-700 text-white font-bold text-xs sm:text-sm shadow-md transition flex items-center gap-2 cursor-pointer"
                    >
                      <FaPrint size={14} />
                      <span>{t("মার্কশিট প্রিন্ট / সেভ করুন", "Print / Save Marksheet")}</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* OFFICIAL BOARD SEARCH FORM BOXES */
                <div className="bg-white rounded-3xl border-2 border-emerald-500/40 shadow-xl overflow-hidden">
                  <div className="bg-gradient-to-r from-[#051939] via-[#092b5e] to-[#051939] text-white p-4 sm:p-5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <FaAward className="text-yellow-400" size={18} />
                      <h3 className="font-bold text-base sm:text-lg">
                        {t("বোর্ড ফলাফল অনুসন্ধান ফর্ম", "Board Result Search Form")}
                      </h3>
                    </div>
                    <span className="text-xs font-bold text-emerald-300 bg-emerald-950/70 border border-emerald-500/40 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-inner">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>লাইভ সার্ভার কানেক্টেড</span>
                    </span>
                  </div>

                  <form onSubmit={handleBoardSearch} className="p-6 sm:p-8 space-y-6">
                    {boardError && (
                      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl text-xs sm:text-sm flex items-center gap-2">
                        <FaTimesCircle className="shrink-0 text-red-500" size={16} />
                        <span>{boardError}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      {/* Examination Box */}
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1.5">
                          {t("পরীক্ষার নাম (Examination)", "Examination")} <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={boardExam}
                          onChange={(e) => setBoardExam(e.target.value)}
                          className="w-full border border-gray-300 rounded-xl py-2.5 px-3.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white font-medium"
                        >
                          <option value="ssc">SSC / Dakhil / Equivalent (এসএসসি / দাখিল)</option>
                          <option value="jsc">JSC / JDC (জেএসসি / জেডিসি)</option>
                        </select>
                      </div>

                      {/* Year Box */}
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1.5">
                          {t("পাসের সন (Passing Year)", "Passing Year")} <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={boardYear}
                          onChange={(e) => setBoardYear(e.target.value)}
                          className="w-full border border-gray-300 rounded-xl py-2.5 px-3.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white font-medium"
                        >
                          {["2024", "2023", "2022", "2021", "2020", "2019", "2018", "2017", "2016", "2015", "2014", "2013", "2012"].map((yr) => (
                            <option key={yr} value={yr}>
                              {yr}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Board Box */}
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1.5">
                          {t("শিক্ষা বোর্ড (Board)", "Board")} <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={boardName}
                          onChange={(e) => setBoardName(e.target.value)}
                          className="w-full border border-gray-300 rounded-xl py-2.5 px-3.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white font-medium"
                        >
                          <option value="sylhet">Sylhet (সিলেট - অত্র বিদ্যালয়)</option>
                          <option value="dhaka">Dhaka (ঢাকা)</option>
                          <option value="comilla">Comilla (কুমিল্লা)</option>
                          <option value="chittagong">Chittagong (চট্টগ্রাম)</option>
                          <option value="rajshahi">Rajshahi (রাজশাহী)</option>
                          <option value="barisal">Barisal (বরিশাল)</option>
                          <option value="jessore">Jessore (যশোর)</option>
                          <option value="dinajpur">Dinajpur (দিনাজপুর)</option>
                          <option value="mymensingh">Mymensingh (ময়মনসিংহ)</option>
                          <option value="madrasah">Madrasah (মাদ্রাসা)</option>
                          <option value="tec">Technical (কারিগরি)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* Roll Number Box */}
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1.5">
                          {t("রোল নম্বর (Roll No)", "Roll Number")} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={boardRoll}
                          onChange={(e) => setBoardRoll(e.target.value)}
                          placeholder="যেমন: 123456"
                          className="w-full border border-gray-300 rounded-xl py-2.5 px-3.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none font-mono"
                        />
                      </div>

                      {/* Registration Number Box */}
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1.5">
                          {t("রেজিস্ট্রেশন নম্বর (Reg No)", "Registration Number")} <span className="text-gray-400 font-normal">({t("ঐচ্ছিক / বিস্তারিত মার্কশিটের জন্য", "Optional")})</span>
                        </label>
                        <input
                          type="text"
                          value={boardReg}
                          onChange={(e) => setBoardReg(e.target.value)}
                          placeholder="যেমন: 1234567890"
                          className="w-full border border-gray-300 rounded-xl py-2.5 px-3.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none font-mono"
                        />
                      </div>
                    </div>

                    {/* Security Captcha Box */}
                    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 sm:p-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1.5">
                            {t("সিকিউরিটি কোড (Security Captcha)", "Security Code (Captcha)")} <span className="text-red-500">*</span>
                          </label>
                          <div className="flex items-center gap-3">
                            {loadingCaptcha ? (
                              <div className="h-11 w-36 bg-gray-200 animate-pulse rounded-xl flex items-center justify-center text-xs text-gray-500">
                                ক্যাপচা লোড হচ্ছে...
                              </div>
                            ) : boardCaptchaImg ? (
                              <img
                                src={boardCaptchaImg}
                                alt="Board Security Captcha"
                                className="h-11 w-36 object-contain rounded-xl border border-gray-300 shadow-sm bg-white"
                              />
                            ) : (
                              <div className="h-11 w-36 bg-red-50 text-red-600 rounded-xl flex items-center justify-center text-xs border border-red-200 font-medium">
                                লোড ব্যর্থ
                              </div>
                            )}

                            <button
                              type="button"
                              onClick={() => fetchBoardCaptcha(false)}
                              disabled={loadingCaptcha}
                              className="px-3 py-2 bg-white hover:bg-gray-100 border border-gray-300 text-gray-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-sm"
                              title="নতুন ক্যাপচা কোড লোড করুন"
                            >
                              <FaRedo className={loadingCaptcha ? "animate-spin" : ""} size={12} />
                              <span>{t("রিফ্রেশ", "Refresh")}</span>
                            </button>
                          </div>
                        </div>

                        <div className="sm:w-64">
                          <label className="block text-xs font-bold text-gray-700 mb-1.5">
                            {t("ছবির কোডটি লিখুন", "Type the Code Above")} <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            maxLength={6}
                            value={boardCaptchaInput}
                            onChange={(e) => setBoardCaptchaInput(e.target.value)}
                            placeholder="৪-ডিজিটের কোড"
                            className="w-full border border-gray-300 rounded-xl py-2.5 px-3.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none font-mono text-center tracking-widest font-bold"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Action Submit Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={handleResetBoard}
                        className="w-full sm:w-auto px-5 py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 font-bold text-sm transition cursor-pointer text-center"
                      >
                        {t("রিসেট করুন", "Reset")}
                      </button>

                      <button
                        type="submit"
                        disabled={boardSearching || loadingCaptcha}
                        className="w-full sm:w-auto px-8 py-3 rounded-xl bg-[#06874A] hover:bg-green-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                      >
                        {boardSearching ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>{t("ফলাফল অনুসন্ধান হচ্ছে...", "Searching Board Results...")}</span>
                          </>
                        ) : (
                          <>
                            <FaSearch size={14} />
                            <span>{t("ফলাফল দেখুন (Get Result)", "Get Board Result")}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Direct Official Server Backup Links */}
              <div className="rounded-2xl border border-gray-200 bg-gray-50/80 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold text-[#051939]">
                    {t("জরুরি প্রয়োজনে সরাসরি সরকারি মূল সার্ভারে ফলাফল দেখতে:", "Direct Official Board Portals:")}
                  </h4>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    {t("ফলাফল প্রকাশের দিনে বোর্ড সার্ভারে অতিরিক্ত চাপের ক্ষেত্রে সরাসরি লিংক ব্যবহার করা যাবে।", "Use official links during heavy peak traffic hours.")}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <a
                    href="https://eboardresults.com/v2/home"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 bg-white hover:bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                  >
                    <span>eBoard Results</span>
                    <FaExternalLinkAlt size={10} />
                  </a>
                  <a
                    href="http://www.educationboardresults.gov.bd/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 bg-white hover:bg-blue-50 border border-blue-300 text-blue-800 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                  >
                    <span>EducationBoardResults.gov.bd</span>
                    <FaExternalLinkAlt size={10} />
                  </a>
                </div>
              </div>

              {/* Sylhet Board Extra Link */}
              <div className="mt-6 p-4 rounded-xl bg-gray-50 border border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-3">
                <span className="text-xs text-gray-600 font-medium">
                  {t(
                    "সিলেট শিক্ষা বোর্ডের বিজ্ঞপ্তি ও বিশেষ নির্দেশনাবলীর জন্য সিলেট শিক্ষা বোর্ড ওয়েবসাইটে ভিজিট করুন:",
                    "For Sylhet Education Board notices and instructions:"
                  )}
                </span>
                <a
                  href="https://sylhetboard.gov.bd/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 underline"
                >
                  <span>sylhetboard.gov.bd</span>
                  <FaExternalLinkAlt size={10} />
                </a>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: INTERNAL RESULTS (CLASSES 6 - 10) */}
        {activeTab === "internal" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Search Filter Form */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border-t-4 border-[#06874A]">
              <div className="border-b border-gray-100 pb-4 mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-[#051939] flex items-center gap-2">
                  <FaSchool className="text-[#06874A]" />
                  {t("বিদ্যালয়ের অভ্যন্তরীণ ফলাফল অনুসন্ধান", "School Internal Results Search")}
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  {t(
                    "শ্রেণি, পরীক্ষার ধরন, শিক্ষাবর্ষ এবং রোল নম্বর নির্বাচন করে ফলাফল দেখুন।",
                    "Select class, examination type, academic year, and roll number to check results."
                  )}
                </p>
              </div>

              <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {/* Select Class */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    {t("শ্রেণি নির্বাচন করুন", "Select Class")}
                  </label>
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="w-full border rounded-xl p-3 text-sm bg-gray-50 focus:bg-white font-medium text-[#051939]"
                  >
                    <option value="6">{t("৬ষ্ঠ শ্রেণি (Class 6)", "Class 6")}</option>
                    <option value="7">{t("৭ম শ্রেণি (Class 7)", "Class 7")}</option>
                    <option value="8">{t("৮ম শ্রেণি (Class 8)", "Class 8")}</option>
                    <option value="9">{t("৯ম শ্রেণি (Class 9)", "Class 9")}</option>
                    <option value="10">{t("১০ম শ্রেণি (Class 10)", "Class 10")}</option>
                  </select>
                </div>

                {/* Select Exam */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    {t("পরীক্ষার ধরন", "Examination")}
                  </label>
                  <select
                    value={selectedExam}
                    onChange={(e) => setSelectedExam(e.target.value)}
                    className="w-full border rounded-xl p-3 text-sm bg-gray-50 focus:bg-white font-medium text-[#051939]"
                  >
                    <option value="বার্ষিক পরীক্ষা">{t("বার্ষিক পরীক্ষা", "Annual Examination")}</option>
                    <option value="অর্ধ-বার্ষিক পরীক্ষা">{t("অর্ধ-বার্ষিক পরীক্ষা", "Half-Yearly Examination")}</option>
                    <option value="প্রাক-নির্বাচনী পরীক্ষা">{t("প্রাক-নির্বাচনী পরীক্ষা", "Pre-Test Examination")}</option>
                  </select>
                </div>

                {/* Select Year */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    {t("শিক্ষাবর্ষ", "Academic Year")}
                  </label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="w-full border rounded-xl p-3 text-sm bg-gray-50 focus:bg-white font-medium text-[#051939]"
                  >
                    <option value="2026">২০২৬ (2026)</option>
                    <option value="2025">২০২৫ (2025)</option>
                    <option value="2024">২০২৪ (2024)</option>
                  </select>
                </div>

                {/* Roll Number Input */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    {t("শিক্ষার্থীর রোল নম্বর", "Student Roll Number")}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="1"
                      placeholder="e.g. 1"
                      value={rollInput}
                      onChange={(e) => setRollInput(e.target.value)}
                      className="w-full border rounded-xl p-3 text-sm bg-gray-50 focus:bg-white font-bold text-[#051939]"
                      required
                    />
                    <button
                      type="submit"
                      disabled={searching}
                      className="bg-[#06874A] hover:bg-green-700 text-white font-bold px-5 rounded-xl shadow-md transition disabled:opacity-60 flex items-center justify-center shrink-0 cursor-pointer"
                    >
                      <FaSearch />
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Result View or Not Found */}
            {searching && (
              <div className="bg-white rounded-3xl p-12 text-center shadow-md text-gray-400">
                {t("ফলাফল অনুসন্ধান করা হচ্ছে...", "Searching for student result...")}
              </div>
            )}

            {!searching && searched && !resultData && (
              <div className="bg-white rounded-3xl p-10 text-center shadow-md border border-gray-200 space-y-3">
                <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-2xl mx-auto">
                  <FaTimesCircle />
                </div>
                <h3 className="font-bold text-lg text-[#051939]">
                  {t("কোনো ফলাফল পাওয়া যায়নি", "No Result Found")}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto">
                  {t(
                    `প্রদত্ত শ্রেণি (${selectedClass}), রোল (${rollInput}) এবং ${selectedExam} (${selectedYear}) এর জন্য কোনো ফলাফল রেকর্ড মেলেনি। অনুগ্রহ করে রোল ও পরীক্ষার তথ্য সঠিকভাবে যাচাই করে আবার চেষ্টা করুন।`,
                    `No result record matched Class ${selectedClass}, Roll ${rollInput}, Exam: ${selectedExam} (${selectedYear}). Please verify and try again.`
                  )}
                </p>
              </div>
            )}

            {!searching && resultData && (
              <div id="printable-internal-card" className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden printable-marksheet">
                {/* School Header on Marksheet */}
                <div className="bg-gradient-to-r from-[#051939] via-[#092b5e] to-[#051939] text-white p-6 sm:p-8 text-center relative">
                  <div className="flex justify-center mb-3">
                    <div className="w-16 h-16 relative bg-white rounded-full p-2 shadow-md">
                      <Image src="/images/logo/logo.png" alt="BAHS" fill className="object-contain p-1" />
                    </div>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wide">
                    {t("বানিয়াচং আদর্শ উচ্চ বিদ্যালয়", "Baniyachong Adarsha High School")}
                  </h2>
                  <p className="text-xs text-gray-200 mt-1">
                    {t(
                      "উপজেলাঃ বানিয়াচং, জেলাঃ হবিগঞ্জ | স্থাপিত: ১৯৮৫ | EIIN: 129344",
                      "Upazila: Baniyachong, District: Habiganj | Est: 1985 | EIIN: 129344"
                    )}
                  </p>
                  <div className="inline-block mt-3 bg-white/15 px-4 py-1 rounded-full text-xs font-bold text-yellow-300 border border-white/20">
                    {resultData.exam} — {resultData.year}
                  </div>

                  {/* Print Button (Hidden during print) */}
                  <button
                    onClick={() => printElement("printable-internal-card", `Result_${resultData.roll || "Marksheet"}`)}
                    className="no-print absolute top-6 right-6 bg-white/20 hover:bg-white/30 text-white p-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border border-white/30"
                  >
                    <FaPrint />
                    <span className="hidden sm:inline">{t("প্রিন্ট / সেভ করুন", "Print")}</span>
                  </button>
                </div>

                {/* Marksheet Body */}
                <div className="p-6 sm:p-8 space-y-6">
                  {/* Student Details Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-200 text-xs">
                    <div>
                      <span className="text-gray-500 block">{t("শিক্ষার্থীর নাম", "Student Name")}</span>
                      <strong className="text-sm text-[#051939]">
                        {language === "en" ? resultData.studentNameEn || resultData.studentName : resultData.studentName}
                      </strong>
                    </div>
                    <div>
                      <span className="text-gray-500 block">{t("রোল নম্বর", "Roll Number")}</span>
                      <strong className="text-sm font-mono text-[#051939]">{resultData.roll}</strong>
                    </div>
                    <div>
                      <span className="text-gray-500 block">{t("শ্রেণি ও শাখা", "Class & Section")}</span>
                      <strong className="text-sm text-[#051939]">
                        {resultData.class} শ্রেণি (শাখা: {resultData.section || "ক"})
                      </strong>
                    </div>
                    <div>
                      <span className="text-gray-500 block">{t("ফলাফলের অবস্থা", "Result Status")}</span>
                      <span
                        className={`inline-block font-extrabold px-2.5 py-0.5 rounded-full text-xs mt-0.5 ${
                          resultData.status === "উত্তীর্ণ" || resultData.statusEn === "Passed"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {resultData.status || "উত্তীর্ণ"} ({resultData.grade || "A+"})
                      </span>
                    </div>
                  </div>

                  {/* GPA and Result Big Verdict */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xl shadow-md">
                        <FaCheckCircle />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                          {t("চূড়ান্ত মূল্যায়ন", "Final Evaluation")}
                        </span>
                        <h4 className="text-lg font-black text-emerald-950">
                          {resultData.status === "উত্তীর্ণ" || resultData.statusEn === "Passed"
                            ? t("কৃতকার্য / উত্তীর্ণ (PASSED)", "CONGRATULATIONS - PASSED")
                            : t("অকৃতকার্য (FAILED)", "FAILED")}
                        </h4>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {resultData.gpa && (
                        <div className="text-right">
                          <span className="text-xs text-gray-500 block font-bold">GPA</span>
                          <span className="text-2xl font-black text-[#051939] font-mono">
                            {resultData.gpa}
                          </span>
                        </div>
                      )}
                      {resultData.totalMarks && (
                        <div className="text-right border-l pl-4 border-emerald-200">
                          <span className="text-xs text-gray-500 block font-bold">
                            {t("মোট নম্বর", "Total Marks")}
                          </span>
                          <span className="text-2xl font-black text-emerald-700 font-mono">
                            {resultData.totalMarks}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Subject-Wise Marks Breakdown Table */}
                  {resultData.marks && typeof resultData.marks === "object" && (
                    <div className="overflow-x-auto border border-gray-200 rounded-2xl">
                      <table className="w-full text-xs sm:text-sm text-left border-collapse">
                        <thead>
                          <tr className="bg-[#051939] text-white uppercase text-xs">
                            <th className="py-3 px-4">{t("ক্রমিক", "SL")}</th>
                            <th className="py-3 px-4">{t("পাঠ্য বিষয়", "Subject")}</th>
                            <th className="py-3 px-4 text-center">{t("পূর্ণমান", "Full Marks")}</th>
                            <th className="py-3 px-4 text-center">{t("প্রাপ্ত নম্বর", "Obtained Marks")}</th>
                            <th className="py-3 px-4 text-center">{t("গ্রেড", "Grade")}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          {Object.entries(resultData.marks).map(([subject, mark]: [string, any], idx) => {
                            const numMark = Number(mark) || 0;
                            const grade =
                              numMark >= 80
                                ? "A+"
                                : numMark >= 70
                                ? "A"
                                : numMark >= 60
                                ? "A-"
                                : numMark >= 50
                                ? "B"
                                : numMark >= 40
                                ? "C"
                                : numMark >= 33
                                ? "D"
                                : "F";

                            return (
                              <tr key={subject} className="hover:bg-gray-50">
                                <td className="py-3 px-4 font-mono text-gray-400">{idx + 1}</td>
                                <td className="py-3 px-4 font-bold text-[#051939]">{subject}</td>
                                <td className="py-3 px-4 text-center font-mono text-gray-500">১০০</td>
                                <td className="py-3 px-4 text-center font-mono font-bold text-emerald-700">
                                  {mark}
                                </td>
                                <td className="py-3 px-4 text-center font-bold">
                                  <span
                                    className={`px-2 py-0.5 rounded text-xs ${
                                      grade === "F"
                                        ? "bg-rose-100 text-rose-700"
                                        : "bg-emerald-100 text-emerald-800"
                                    }`}
                                  >
                                    {grade}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Marksheet Footer / Signatures */}
                  <div className="pt-8 mt-6 border-t border-gray-200 grid grid-cols-2 sm:grid-cols-3 gap-6 text-center text-xs text-gray-600">
                    <div>
                      <div className="w-32 border-b border-gray-400 mx-auto mb-1.5"></div>
                      <span>{t("শ্রেণি শিক্ষকের স্বাক্ষর", "Class Teacher's Signature")}</span>
                    </div>
                    <div className="hidden sm:block">
                      <div className="w-32 border-b border-gray-400 mx-auto mb-1.5"></div>
                      <span>{t("পরীক্ষা নিয়ন্ত্রক", "Controller of Exams")}</span>
                    </div>
                    <div>
                      <div className="w-32 border-b border-gray-400 mx-auto mb-1.5"></div>
                      <span>{t("প্রধান শিক্ষকের স্বাক্ষর", "Headmaster's Signature")}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
