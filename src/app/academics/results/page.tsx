"use client";
import { useState } from "react";
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
  FaExpand,
  FaCompress,
  FaCopy,
  FaCheck,
  FaServer,
  FaBolt,
} from "react-icons/fa";
import { useLanguage } from "@/lib/LanguageContext";

export default function ResultsPage() {
  const { t, language } = useLanguage();

  const [activeTab, setActiveTab] = useState<"internal" | "board">("board");

  // Board result portal state
  const [boardServer, setBoardServer] = useState<"eboard" | "gov">("eboard");
  const [iframeKey, setIframeKey] = useState<number>(0);
  const [isIframeLoading, setIsIframeLoading] = useState<boolean>(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isPortalExpanded, setIsPortalExpanded] = useState<boolean>(false);

  const handleCopy = (text: string, key: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (e) {
      // Ignore
    }
  };

  const handleReloadPortal = () => {
    setIsIframeLoading(true);
    setIframeKey((prev) => prev + 1);
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

  const handlePrint = () => {
    window.print();
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

              {/* LIVE BOARD RESULTS PORTAL (EMBEDDED LIVE MIRROR) */}
              <div
                className={`transition-all duration-300 ${
                  isPortalExpanded
                    ? "fixed inset-0 z-[100] bg-[#051939]/90 backdrop-blur-md p-2 sm:p-5 flex flex-col"
                    : "rounded-2xl border-2 border-emerald-500/30 bg-white shadow-xl overflow-hidden"
                }`}
              >
                {/* Control Toolbar */}
                <div className="bg-gradient-to-r from-[#051939] via-[#092b5e] to-[#051939] text-white p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 border-b border-white/10">
                  <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-500/40 px-3 py-1 rounded-full shadow-inner">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                      <span>{t("লাইভ ফলাফল পোর্টাল", "Live Result Portal")}</span>
                    </span>

                    {/* Server Switcher */}
                    <div className="bg-white/10 p-1 rounded-xl flex items-center gap-1 text-xs">
                      <button
                        type="button"
                        onClick={() => {
                          if (boardServer !== "eboard") {
                            setBoardServer("eboard");
                            setIsIframeLoading(true);
                            setIframeKey((k) => k + 1);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1.5 ${
                          boardServer === "eboard"
                            ? "bg-emerald-600 text-white shadow-sm"
                            : "text-gray-300 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        <FaBolt className={boardServer === "eboard" ? "text-yellow-300" : "text-gray-400"} size={11} />
                        <span>eBoard Results (মার্কশিট সহ)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (boardServer !== "gov") {
                            setBoardServer("gov");
                            setIsIframeLoading(true);
                            setIframeKey((k) => k + 1);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1.5 ${
                          boardServer === "gov"
                            ? "bg-blue-600 text-white shadow-sm"
                            : "text-gray-300 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        <FaServer className={boardServer === "gov" ? "text-yellow-300" : "text-gray-400"} size={11} />
                        <span>Education Board Server</span>
                      </button>
                    </div>
                  </div>

                  {/* Actions (Reload, Expand/Contract, Fallback Open) */}
                  <div className="flex items-center gap-2 text-xs">
                    <button
                      type="button"
                      onClick={handleReloadPortal}
                      title="পোর্টাল পুনরায় লোড করুন"
                      className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg font-medium transition cursor-pointer flex items-center gap-1.5 text-gray-200 hover:text-white"
                    >
                      <FaRedo size={11} className={isIframeLoading ? "animate-spin" : ""} />
                      <span className="hidden sm:inline">{t("রিলোড", "Reload")}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsPortalExpanded(!isPortalExpanded)}
                      title={isPortalExpanded ? "স্বাভাবিক আকার করুন" : "বড় স্ক্রিনে দেখুন"}
                      className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg font-medium transition cursor-pointer flex items-center gap-1.5 text-gray-200 hover:text-white"
                    >
                      {isPortalExpanded ? (
                        <>
                          <FaCompress size={12} />
                          <span className="hidden sm:inline">{t("ছোট করুন", "Exit Fullscreen")}</span>
                        </>
                      ) : (
                        <>
                          <FaExpand size={12} />
                          <span className="hidden sm:inline">{t("বড় করুন", "Expand")}</span>
                        </>
                      )}
                    </button>

                    <a
                      href={
                        boardServer === "eboard"
                          ? "https://eboardresults.com/v2/home"
                          : "https://www.educationboardresults.gov.bd/v2/home"
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      title="আলাদা উইন্ডোতে ওপেন করুন"
                      className="px-2.5 py-1.5 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition"
                    >
                      <FaExternalLinkAlt size={12} />
                    </a>
                  </div>
                </div>

                {/* Helpful Instruction Tip Bar */}
                <div className="bg-amber-50 border-b border-amber-200/60 px-4 py-2 text-xs text-amber-900 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-amber-800">💡 {t("নির্দেশনা:", "Guide:")}</span>
                    <span>
                      {t(
                        "নিচের বক্সে Examination (SSC/JSC) ও Year নির্বাচন করুন, Board হিসেবে 'Sylhet' দিন, এরপর Roll, Reg নং এবং সিকিউরিটি কোড লিখে Get Result চাপুন।",
                        "Select Examination (SSC/JSC), Year, set Board as 'Sylhet', then enter Roll, Reg and Captcha security key."
                      )}
                    </span>
                  </div>
                  <div className="hidden md:flex items-center gap-2 text-[11px] font-semibold text-gray-600 shrink-0">
                    <span>EIIN: 129344</span>
                    <span>•</span>
                    <span>Centre: 1903</span>
                  </div>
                </div>

                {/* The Embedded Frame Container */}
                <div className={`relative bg-gray-100 ${isPortalExpanded ? "flex-1 w-full" : "w-full h-[760px] sm:h-[840px]"}`}>
                  {isIframeLoading && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gray-50/95 backdrop-blur-sm gap-3">
                      <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                      <div className="text-sm font-bold text-[#051939]">
                        {t("বোর্ড ফলাফল সার্ভারের সাথে সংযুক্ত হচ্ছে...", "Connecting to Board Result Server...")}
                      </div>
                      <p className="text-xs text-gray-500 max-w-sm text-center">
                        {t(
                          "অনুগ্রহ করে কয়েক সেকেন্ড অপেক্ষা করুন। সার্ভার রেসপন্স করলে নিচে সরাসরি ফর্মটি প্রদর্শিত হবে।",
                          "Please wait a few seconds while the official result portal loads."
                        )}
                      </p>
                    </div>
                  )}

                  <iframe
                    key={`${boardServer}-${iframeKey}`}
                    src={
                      boardServer === "eboard"
                        ? "https://eboardresults.com/v2/home"
                        : "https://www.educationboardresults.gov.bd/v2/home"
                    }
                    onLoad={() => setIsIframeLoading(false)}
                    className="w-full h-full border-0 bg-white"
                    title="Bangladesh Education Board Official Results Mirror"
                    allow="clipboard-write; fullscreen"
                  />
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
                    onClick={handlePrint}
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
