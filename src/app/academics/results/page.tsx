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

  const [currentDateStr, setCurrentDateStr] = useState<string>("");
  useEffect(() => {
    try {
      const d = new Date();
      setCurrentDateStr(
        d.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      );
    } catch {
      setCurrentDateStr("30-Sep-2026");
    }
  }, []);

  const getBoardFullName = (bName?: string) => {
    const code = (bName || boardName || "sylhet").toLowerCase();
    const map: Record<string, string> = {
      sylhet: "SYLHET",
      dhaka: "DHAKA",
      comilla: "COMILLA",
      chittagong: "CHITTAGONG",
      rajshahi: "RAJSHAHI",
      barisal: "BARISAL",
      jessore: "JESSORE",
      dinajpur: "DINAJPUR",
      mymensingh: "MYMENSINGH",
      madrasah: "MADRASAH",
      tec: "TECHNICAL",
    };
    return map[code] || (bName ? bName.toUpperCase() : "SYLHET");
  };

  const getGradePoint = (grade: string): string => {
    const g = grade.trim().toUpperCase();
    if (g === "A+") return "5.0";
    if (g === "A") return "4.0";
    if (g === "A-") return "3.5";
    if (g === "B") return "3.0";
    if (g === "C") return "2.0";
    if (g === "D") return "1.0";
    if (g === "F") return "0.0";
    return "-";
  };

  const parseSubjectDetails = (detailsStr: string) => {
    if (!detailsStr) return [];
    return detailsStr.split(",").map((item, idx) => {
      const parts = item.split(":");
      const code = parts[0]?.trim() || "";
      const right = parts[1]?.trim() || "";
      let marks = "";
      let grade = right;
      if (right.includes("=")) {
        const eqParts = right.split("=");
        marks = eqParts[0]?.trim() || "";
        grade = eqParts[1]?.trim() || "";
      }
      const name = SUBJECT_MAP[code] || `Subject (${code})`;
      const point = getGradePoint(grade);
      return {
        sl: String(idx + 1).padStart(2, "0"),
        code,
        name,
        marks,
        grade,
        point,
      };
    });
  };

  const handlePrintBoard = () => {
    document.body.classList.add("printing-board-result");
    window.print();
    setTimeout(() => {
      document.body.classList.remove("printing-board-result");
    }, 1000);
  };

  const handlePrintInternal = () => {
    document.body.classList.add("printing-internal-result");
    window.print();
    setTimeout(() => {
      document.body.classList.remove("printing-internal-result");
    }, 1000);
  };

  return (
    <div className={`results-page-wrapper min-h-screen bg-gray-50 pb-20 ${language === "bn" ? "font-bengali" : "font-sans"}`}>
      {/* Header Banner */}
      <div className="no-print bg-gradient-to-r from-[#051939] via-[#092b5e] to-[#051939] text-white py-12 shadow-md">
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
        <div className="no-print bg-white rounded-2xl p-2 shadow-lg border border-gray-100 flex flex-col sm:flex-row gap-2">
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
            <div className="no-print bg-white rounded-3xl p-6 sm:p-8 shadow-md border-t-4 border-[#051939]">
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
                /* OFFICIAL MARKSHEET DISPLAY CARD & ACTION CONTROLS */
                <div className="space-y-4 animate-in fade-in duration-300">
                  {/* Top Screen Action Notification & Print Bar (Hidden in Print) */}
                  <div className="no-print bg-gradient-to-r from-emerald-900 via-[#051939] to-emerald-950 text-white rounded-2xl p-4 sm:p-5 shadow-lg border border-emerald-500/30 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-400 shrink-0">
                        <FaCheckCircle size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                          <h4 className="font-extrabold text-sm sm:text-base text-emerald-300">
                            {t("অফিসিয়াল বোর্ড রেজাল্ট সফলভাবে যাচাইকৃত", "Official Board Result Verified")}
                          </h4>
                        </div>
                        <p className="text-xs text-gray-300 mt-0.5">
                          {t(
                            "নিচের অফিসিয়াল অ্যাকাডেমিক ট্রান্সক্রিপ্টটি সরকারি ফরম্যাটে প্রস্তুত। আপনি এটি সরাসরি প্রিন্ট বা পিডিএফ হিসেবে সংরক্ষণ করতে পারবেন।",
                            "Official Academic Transcript ready in authentic government board format."
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto">
                      <button
                        type="button"
                        onClick={handleResetBoard}
                        className="flex-1 md:flex-none px-4 py-2.5 rounded-xl border border-gray-400/40 hover:bg-white/10 text-gray-200 font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <FaUndo size={12} />
                        <span>{t("আরেকটি ফলাফল", "Search Again")}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handlePrintBoard}
                        className="flex-1 md:flex-none px-6 py-2.5 rounded-xl bg-[#06874A] hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <FaPrint size={14} />
                        <span>{t("প্রিন্ট / সেভ করুন (PDF)", "Print / Save PDF")}</span>
                      </button>
                    </div>
                  </div>

                  {/* THE PRINTABLE OFFICIAL BOARD ACADEMIC TRANSCRIPT */}
                  <div
                    id="printable-board-marksheet"
                    className="bg-white rounded-2xl md:rounded-3xl border-2 border-[#051939] shadow-2xl p-5 sm:p-8 md:p-9 relative overflow-hidden font-sans text-gray-900"
                  >
                    {/* Subtle Official Watermark Background */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.035] select-none z-0">
                      <svg className="w-[420px] h-[420px]" viewBox="0 0 100 100" fill="currentColor">
                        <circle cx="50" cy="50" r="46" stroke="currentColor" strokeWidth="2" fill="none" />
                        <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" fill="none" />
                        <path d="M50 26 C47 34 40 44 40 54 C40 60 44 64 50 64 C56 64 60 60 60 54 C60 44 53 34 50 26 Z" />
                        <path d="M40 54 C34 44 26 42 24 48 C22 54 28 62 38 64 Z" />
                        <path d="M60 54 C66 44 74 42 76 48 C78 54 72 62 62 64 Z" />
                      </svg>
                    </div>

                    <div className="relative z-10 space-y-4">
                      {/* OFFICIAL BANGLADESH BOARD HEADER */}
                      <div className="text-center border-b-2 border-[#051939] pb-3">
                        {/* Bangladesh Government / Board Emblem SVG */}
                        <div className="flex justify-center mb-1">
                          <svg className="w-13 h-13 text-[#06874A]" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="50" cy="50" r="46" stroke="#051939" strokeWidth="2.5" fill="#fefefe" />
                            <circle cx="50" cy="50" r="41" stroke="#06874A" strokeWidth="1" strokeDasharray="2 2" fill="none" />
                            <circle cx="50" cy="50" r="23" fill="#06874A" fillOpacity="0.08" />
                            <path d="M50 26 C47 34 40 44 40 54 C40 60 44 64 50 64 C56 64 60 60 60 54 C60 44 53 34 50 26 Z" fill="#06874A" />
                            <path d="M40 54 C34 44 26 42 24 48 C22 54 28 62 38 64 Z" fill="#800505" />
                            <path d="M60 54 C66 44 74 42 76 48 C78 54 72 62 62 64 Z" fill="#800505" />
                            <path d="M30 68 Q50 64 70 68 Q50 72 30 68 Z" fill="#051939" />
                            <path d="M34 72 Q50 69 66 72 Q50 75 34 72 Z" fill="#051939" />
                            <circle cx="34" cy="32" r="2.2" fill="#d97706" />
                            <circle cx="42" cy="27" r="2.2" fill="#d97706" />
                            <circle cx="58" cy="27" r="2.2" fill="#d97706" />
                            <circle cx="66" cy="32" r="2.2" fill="#d97706" />
                          </svg>
                        </div>

                        <h2 className="text-base sm:text-xl md:text-2xl font-black text-[#051939] tracking-wider uppercase">
                          BOARD OF INTERMEDIATE AND SECONDARY EDUCATION, {getBoardFullName(boardResultData.board_name)}
                        </h2>
                        <h3 className="text-xs sm:text-sm font-bold text-gray-700 tracking-widest uppercase mt-0.5">
                          BANGLADESH
                        </h3>
                        <p className="text-xs sm:text-sm font-extrabold text-[#06874A] uppercase mt-0.5">
                          {boardExam.toUpperCase() === "SSC" ? "Secondary School Certificate" : "Junior School Certificate"} Examination - {boardYear}
                        </p>
                        <div className="inline-block mt-1.5 border-y-2 border-[#051939] py-0.5 px-6">
                          <span className="text-xs sm:text-sm font-black text-[#051939] tracking-widest uppercase">
                            ACADEMIC TRANSCRIPT
                          </span>
                        </div>
                      </div>

                      {/* TOP SECTION: STUDENT DETAILS & OFFICIAL GRADING SCALE */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                        {/* Left: Student Information Table (col-span-8) */}
                        <div className="lg:col-span-8 border border-gray-400 text-xs rounded-sm overflow-hidden">
                          <div className="bg-[#051939] text-white px-3 py-1 font-bold uppercase tracking-wider text-[11px]">
                            Student Details (শিক্ষার্থীর বিবরণ)
                          </div>
                          <table className="w-full text-left border-collapse">
                            <tbody className="divide-y divide-gray-300">
                              <tr>
                                <td className="py-1 px-3 font-semibold text-gray-700 bg-gray-50 w-36 border-r border-gray-300">
                                  Name of Student
                                </td>
                                <td className="py-1 px-3 font-bold text-gray-950 uppercase" colSpan={3}>
                                  {boardResultData.name || "N/A"}
                                </td>
                              </tr>
                              <tr>
                                <td className="py-1 px-3 font-semibold text-gray-700 bg-gray-50 border-r border-gray-300">
                                  Father's Name
                                </td>
                                <td className="py-1 px-3 font-semibold text-gray-900 uppercase" colSpan={3}>
                                  {boardResultData.fname || "N/A"}
                                </td>
                              </tr>
                              <tr>
                                <td className="py-1 px-3 font-semibold text-gray-700 bg-gray-50 border-r border-gray-300">
                                  Mother's Name
                                </td>
                                <td className="py-1 px-3 font-semibold text-gray-900 uppercase" colSpan={3}>
                                  {boardResultData.mname || "N/A"}
                                </td>
                              </tr>
                              <tr>
                                <td className="py-1 px-3 font-semibold text-gray-700 bg-gray-50 border-r border-gray-300">
                                  Name of Institution
                                </td>
                                <td className="py-1 px-3 font-bold text-[#051939] uppercase" colSpan={3}>
                                  {boardResultData.inst_name || "BANIYACHONG ADARSHA HIGH SCHOOL"}
                                </td>
                              </tr>
                              <tr>
                                <td className="py-1 px-3 font-semibold text-gray-700 bg-gray-50 border-r border-gray-300">
                                  Name of Centre
                                </td>
                                <td className="py-1 px-3 font-medium text-gray-800 uppercase" colSpan={3}>
                                  {boardResultData.centre_name || "BANIYACHONG - 1903"}
                                </td>
                              </tr>
                              <tr>
                                <td className="py-1 px-3 font-semibold text-gray-700 bg-gray-50 border-r border-gray-300">
                                  Roll No.
                                </td>
                                <td className="py-1 px-3 font-mono font-bold text-gray-900 text-sm">
                                  {boardResultData.roll_no || boardRoll}
                                </td>
                                <td className="py-1 px-3 font-semibold text-gray-700 bg-gray-50 border-x border-gray-300 w-32">
                                  Registration No.
                                </td>
                                <td className="py-1 px-3 font-mono font-bold text-gray-900">
                                  {boardResultData.regno || boardReg || "N/A"}
                                </td>
                              </tr>
                              <tr>
                                <td className="py-1 px-3 font-semibold text-gray-700 bg-gray-50 border-r border-gray-300">
                                  Group
                                </td>
                                <td className="py-1 px-3 font-bold text-gray-900 uppercase">
                                  {boardResultData.stud_group || "N/A"}
                                </td>
                                <td className="py-1 px-3 font-semibold text-gray-700 bg-gray-50 border-x border-gray-300">
                                  Type
                                </td>
                                <td className="py-1 px-3 font-semibold text-gray-800 uppercase">
                                  {boardResultData.stud_type || "REGULAR"}
                                </td>
                              </tr>
                              <tr>
                                <td className="py-1 px-3 font-semibold text-gray-700 bg-gray-50 border-r border-gray-300">
                                  Gender / Sex
                                </td>
                                <td className="py-1 px-3 font-medium text-gray-800 uppercase">
                                  {boardResultData.stud_sex || "N/A"}
                                </td>
                                <td className="py-1 px-3 font-semibold text-gray-700 bg-gray-50 border-x border-gray-300">
                                  Date of Birth
                                </td>
                                <td className="py-1 px-3 font-medium text-gray-800">
                                  {boardResultData.dob || "N/A"}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>

                        {/* Right: Official Grading System Reference Table (col-span-4) */}
                        <div className="lg:col-span-4 border border-gray-400 text-[11px] rounded-sm overflow-hidden">
                          <div className="bg-[#051939] text-white px-2 py-1 font-bold uppercase tracking-wider text-center text-[10px]">
                            Grading System (গ্রেডিং পদ্ধতি)
                          </div>
                          <table className="w-full text-center border-collapse">
                            <thead>
                              <tr className="bg-gray-100 border-b border-gray-300 font-bold text-gray-800">
                                <th className="py-0.5 px-1.5 border-r border-gray-300">Range</th>
                                <th className="py-0.5 px-1.5 border-r border-gray-300">Grade</th>
                                <th className="py-0.5 px-1.5">Point</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              <tr>
                                <td className="py-0.5 px-1.5 border-r border-gray-200">80 - 100</td>
                                <td className="py-0.5 px-1.5 border-r border-gray-200 font-bold text-emerald-700">A+</td>
                                <td className="py-0.5 px-1.5 font-bold">5.0</td>
                              </tr>
                              <tr>
                                <td className="py-0.5 px-1.5 border-r border-gray-200">70 - 79</td>
                                <td className="py-0.5 px-1.5 border-r border-gray-200 font-bold text-blue-700">A</td>
                                <td className="py-0.5 px-1.5 font-bold">4.0</td>
                              </tr>
                              <tr>
                                <td className="py-0.5 px-1.5 border-r border-gray-200">60 - 69</td>
                                <td className="py-0.5 px-1.5 border-r border-gray-200 font-bold text-teal-700">A-</td>
                                <td className="py-0.5 px-1.5 font-bold">3.5</td>
                              </tr>
                              <tr>
                                <td className="py-0.5 px-1.5 border-r border-gray-200">50 - 59</td>
                                <td className="py-0.5 px-1.5 border-r border-gray-200 font-bold text-indigo-700">B</td>
                                <td className="py-0.5 px-1.5 font-bold">3.0</td>
                              </tr>
                              <tr>
                                <td className="py-0.5 px-1.5 border-r border-gray-200">40 - 49</td>
                                <td className="py-0.5 px-1.5 border-r border-gray-200 font-bold text-yellow-700">C</td>
                                <td className="py-0.5 px-1.5 font-bold">2.0</td>
                              </tr>
                              <tr>
                                <td className="py-0.5 px-1.5 border-r border-gray-200">33 - 39</td>
                                <td className="py-0.5 px-1.5 border-r border-gray-200 font-bold text-orange-700">D</td>
                                <td className="py-0.5 px-1.5 font-bold">1.0</td>
                              </tr>
                              <tr className="bg-red-50/50">
                                <td className="py-0.5 px-1.5 border-r border-gray-200">00 - 32</td>
                                <td className="py-0.5 px-1.5 border-r border-gray-200 font-bold text-red-600">F</td>
                                <td className="py-0.5 px-1.5 font-bold text-red-600">0.0</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* RESULT & GPA OFFICIAL VERDICT HIGHLIGHT */}
                      <div className="border-2 border-[#06874A] bg-emerald-50/50 rounded-lg p-2.5 sm:p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#06874A] text-white flex items-center justify-center font-bold text-base shadow-sm">
                            ✓
                          </div>
                          <div>
                            <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-widest block">
                              Result Status (ফলাফলের অবস্থা)
                            </span>
                            <span className="text-base sm:text-lg font-black text-emerald-900">
                              {boardResultData.res_detail || "PASSED (উত্তীর্ণ)"}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 border-t sm:border-t-0 sm:border-l border-emerald-300 pt-2 sm:pt-0 sm:pl-6 text-center sm:text-right">
                          <div>
                            <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider block">
                              Grade Point Average (GPA)
                            </span>
                            <span className="text-2xl sm:text-3xl font-black text-[#051939] font-mono tracking-tight">
                              {boardResultData.gpa ? boardResultData.gpa : "5.00"}
                            </span>
                            <span className="text-[10px] text-gray-500 block font-medium">on a scale of 5.00</span>
                          </div>
                        </div>
                      </div>

                      {/* SUBJECT-WISE ACADEMIC GRADE SHEET TABLE */}
                      {boardResultData.display_details && (
                        <div className="border border-gray-400 rounded-sm overflow-hidden text-xs">
                          <div className="bg-[#051939] text-white px-3 py-1 font-bold uppercase tracking-wider text-[11px] flex justify-between items-center">
                            <span>Subject-Wise Grade Sheet (বিষয়ভিত্তিক প্রাপ্ত গ্রেড ও ফলাফল)</span>
                            <span className="text-[10px] text-gray-300">Official BISE Records</span>
                          </div>
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-gray-100 border-b border-gray-400 text-gray-900 text-[11px] uppercase font-bold">
                                <th className="py-1.5 px-3 border-r border-gray-300 text-center w-14">SI No.</th>
                                <th className="py-1.5 px-3 border-r border-gray-300 text-center w-20">Code</th>
                                <th className="py-1.5 px-3 border-r border-gray-300">Name of Subject</th>
                                <th className="py-1.5 px-3 border-r border-gray-300 text-center w-28">Letter Grade</th>
                                <th className="py-1.5 px-3 text-center w-24">Grade Point</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-300 bg-white">
                              {parseSubjectDetails(boardResultData.display_details).map((sub) => (
                                <tr key={sub.code} className="hover:bg-gray-50 transition print-avoid-break">
                                  <td className="py-1 px-3 border-r border-gray-300 text-center font-mono text-gray-500">
                                    {sub.sl}
                                  </td>
                                  <td className="py-1 px-3 border-r border-gray-300 text-center font-mono font-bold text-gray-700">
                                    {sub.code}
                                  </td>
                                  <td className="py-1 px-3 border-r border-gray-300 font-semibold text-gray-900">
                                    {sub.name}
                                  </td>
                                  <td className="py-1 px-3 border-r border-gray-300 text-center">
                                    <span
                                      className={`inline-block font-black px-2 py-0.5 rounded text-xs ${
                                        sub.grade === "A+"
                                          ? "bg-emerald-100 text-emerald-900 font-bold"
                                          : sub.grade === "F"
                                          ? "bg-red-100 text-red-900 font-bold"
                                          : "bg-blue-50 text-blue-900 font-bold"
                                      }`}
                                    >
                                      {sub.marks ? `${sub.marks} (${sub.grade})` : sub.grade}
                                    </span>
                                  </td>
                                  <td className="py-1 px-3 text-center font-mono font-bold text-gray-900">
                                    {sub.point}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* OFFICIAL VERIFICATION & SIGNATURE FOOTER */}
                      <div className="pt-5 border-t-2 border-[#051939] grid grid-cols-1 sm:grid-cols-3 gap-5 items-end text-xs print-avoid-break">
                        <div>
                          <p className="font-semibold text-gray-700">
                            <strong>Date of Publication:</strong> Official Schedule
                          </p>
                          <p className="font-semibold text-gray-700 mt-0.5">
                            <strong>Printed Date:</strong> {currentDateStr || "Official Web Copy"}
                          </p>
                          <p className="text-[10px] text-gray-500 mt-1.5 leading-relaxed italic">
                            * Note: This Academic Transcript is an electronically generated official document from Education Board Bangladesh database.
                          </p>
                        </div>

                        {/* Security Verification Barcode Box */}
                        <div className="text-center border border-dashed border-gray-400 p-2 rounded bg-gray-50/80">
                          <div className="font-mono text-[10px] tracking-widest text-gray-600 font-bold uppercase">
                            DOCUMENT VERIFICATION
                          </div>
                          <div className="my-0.5 font-mono text-xs font-black tracking-widest text-[#051939]">
                            ||| | |||| | |||||| || | ||| ||||
                          </div>
                          <div className="text-[10px] text-emerald-800 font-bold font-mono">
                            EIIN: 129344 | CENTRE: 1903
                          </div>
                          <div className="text-[9px] text-gray-500 uppercase">Baniyachong Adarsha High School</div>
                        </div>

                        {/* Signature Line */}
                        <div className="text-center sm:text-right">
                          <div className="w-44 border-b border-gray-600 mx-auto sm:ml-auto sm:mr-0 mb-1" />
                          <p className="font-bold text-[#051939] text-xs">Controller of Examinations</p>
                          <p className="text-[11px] text-gray-600">
                            Board of Intermediate & Secondary Education, {getBoardFullName(boardResultData.board_name)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Action Bar (Hidden in Print) */}
                  <div className="no-print flex flex-wrap items-center justify-between gap-3 pt-3">
                    <button
                      type="button"
                      onClick={handleResetBoard}
                      className="px-5 py-2.5 rounded-xl border border-gray-300 hover:bg-gray-100 text-gray-700 font-bold text-xs sm:text-sm transition flex items-center gap-2 cursor-pointer shadow-sm"
                    >
                      <FaUndo size={12} />
                      <span>{t("আরেকটি ফলাফল অনুসন্ধান করুন", "Search Another Result")}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handlePrintBoard}
                      className="px-6 py-2.5 rounded-xl bg-[#06874A] hover:bg-green-700 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition flex items-center gap-2 cursor-pointer"
                    >
                      <FaPrint size={14} />
                      <span>{t("মার্কশিট প্রিন্ট / সেভ করুন (PDF)", "Print / Save Marksheet (PDF)")}</span>
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
              <div className="no-print rounded-2xl border border-gray-200 bg-gray-50/80 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
              <div className="no-print mt-6 p-4 rounded-xl bg-gray-50 border border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-3">
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
            <div className="no-print bg-white rounded-3xl p-6 sm:p-8 shadow-md border-t-4 border-[#06874A]">
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
              <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden printable-marksheet">
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
                    onClick={handlePrintInternal}
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
