"use client";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  FaCertificate,
  FaPrint,
  FaDownload,
  FaArrowLeft,
  FaEye,
  FaUserGraduate,
  FaCheckCircle,
  FaImage,
  FaUndo,
  FaSpinner,
  FaSearch,
  FaInfoCircle,
  FaPenNib,
  FaAward,
  FaSchool,
} from "react-icons/fa";
import { toJpeg } from "html-to-image";
import { useLanguage } from "@/lib/LanguageContext";

export type TestimonialType = "board" | "general";

export interface TestimonialData {
  type: TestimonialType;
  serialNo: string;
  date: string;
  studentName: string;
  fatherName: string;
  motherName: string;
  village: string;
  postOffice: string;
  upazilla: string;
  district: string;
  examName: string;
  boardName: string;
  gpa: string;
  passYear: string;
  group: string;
  rollNo: string;
  regNo: string;
  session: string;
  studentClass: string;
  section: string;
  dobNumeric: string;
  dobInWords: string;
}

const DEFAULT_BOARD_DATA: TestimonialData = {
  type: "board",
  serialNo: "0001",
  date: new Date().toLocaleDateString("en-GB").replace(/\//g, "-"),
  studentName: "",
  fatherName: "",
  motherName: "",
  village: "",
  postOffice: "",
  upazilla: "Baniyachong",
  district: "Habiganj",
  examName: "Secondary School Certificate Examination",
  boardName: "Board of Intermediate and Secondary Education , Sylhet",
  gpa: "",
  passYear: new Date().getFullYear().toString(),
  group: "Science",
  rollNo: "",
  regNo: "",
  session: "",
  studentClass: "10",
  section: "",
  dobNumeric: "",
  dobInWords: "",
};

const DEFAULT_GENERAL_DATA: TestimonialData = {
  type: "general",
  serialNo: "0001",
  date: new Date().toLocaleDateString("en-GB").replace(/\//g, "-"),
  studentName: "",
  fatherName: "",
  motherName: "",
  village: "",
  postOffice: "",
  upazilla: "Baniyachong",
  district: "Habiganj",
  examName: "Annual Examination",
  boardName: "Baniyachong Adarsha High School",
  gpa: "",
  passYear: new Date().getFullYear().toString(),
  group: "General",
  rollNo: "",
  regNo: "",
  session: "",
  studentClass: "8",
  section: "A",
  dobNumeric: "",
  dobInWords: "",
};

export default function TestimonialClient() {
  const { t, language } = useLanguage();
  const searchParams = useSearchParams();
  const [certType, setCertType] = useState<TestimonialType>("board");
  const [data, setData] = useState<TestimonialData>(DEFAULT_BOARD_DATA);
  const [downloadingJpg, setDownloadingJpg] = useState(false);
  const printAreaRef = useRef<HTMLDivElement>(null);

  // Quick lookup state
  const [searchClass, setSearchClass] = useState("10");
  const [searchRoll, setSearchRoll] = useState("");
  const [searchingData, setSearchingData] = useState(false);
  const [searchMessage, setSearchMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);

  // Fetch initial serial number from counter API (padded to 0001)
  useEffect(() => {
    fetch("/api/testimonial-counter")
      .then((res) => res.json())
      .then((resData) => {
        if (resData && typeof resData.count === "number") {
          const formatted = String(resData.count).padStart(4, "0");
          setData((prev) => ({ ...prev, serialNo: formatted }));
        }
      })
      .catch(() => {
        // Fallback to 0001
        setData((prev) => ({ ...prev, serialNo: "0001" }));
      });
  }, []);

  // Handle certType change
  const handleTypeChange = (newType: TestimonialType) => {
    setCertType(newType);
    setData((prev) => ({
      ...(newType === "board" ? DEFAULT_BOARD_DATA : DEFAULT_GENERAL_DATA),
      serialNo: prev.serialNo, // Preserve current serial
      type: newType,
    }));
  };

  // Auto-fill from URL query params
  useEffect(() => {
    const pRoll = searchParams.get("roll");
    const pName = searchParams.get("name");
    const pReg = searchParams.get("reg");
    const pYear = searchParams.get("year");
    const pGpa = searchParams.get("gpa");
    const pGroup = searchParams.get("group");
    const pFather = searchParams.get("father");
    const pMother = searchParams.get("mother");
    const pSession = searchParams.get("session");
    const pClass = searchParams.get("class");
    const pSection = searchParams.get("section");
    const pType = searchParams.get("type") as TestimonialType | null;

    if (pRoll || pName || pGpa || pClass) {
      const isBoard = pType ? pType === "board" : (pClass === "10" || pClass === "8" || Boolean(pReg));
      const targetType = isBoard ? "board" : "general";
      setCertType(targetType);

      setData((prev) => ({
        ...prev,
        type: targetType,
        studentName: pName || prev.studentName,
        rollNo: pRoll || prev.rollNo,
        regNo: pReg || prev.regNo,
        passYear: pYear || prev.passYear,
        gpa: pGpa || prev.gpa,
        group: pGroup || prev.group,
        fatherName: pFather || prev.fatherName,
        motherName: pMother || prev.motherName,
        session: pSession || prev.session,
        studentClass: pClass || prev.studentClass,
        section: pSection || prev.section,
      }));
      if (pClass) setSearchClass(pClass);
      if (pRoll) setSearchRoll(pRoll);
      setSearchMessage({
        type: "success",
        text: `ফলাফল সার্ভার থেকে তথ্য সফলভাবে যুক্ত করা হয়েছে!`,
      });
    }
  }, [searchParams]);

  const handleLookupResult = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchRoll.trim()) {
      setSearchMessage({
        type: "error",
        text: "অনুগ্রহ করে শিক্ষার্থীর রোল নম্বর লিখুন।",
      });
      return;
    }

    setSearchingData(true);
    setSearchMessage(null);

    try {
      const res = await fetch(`/api/results?class=${encodeURIComponent(searchClass)}&roll=${encodeURIComponent(searchRoll.trim())}`);
      const json = await res.json();

      if (json.results && json.results.length > 0) {
        const student = json.results[0];
        const isGeneral = searchClass !== "10" && !student.regNo;
        const newType: TestimonialType = isGeneral ? "general" : "board";
        setCertType(newType);

        setData((prev) => ({
          ...prev,
          type: newType,
          studentName: student.studentNameEn || student.studentName || prev.studentName,
          rollNo: String(student.roll || searchRoll.trim()),
          regNo: student.regNo || student.reg || "",
          passYear: String(student.year || prev.passYear),
          gpa: String(student.gpa || prev.gpa),
          group: student.group || student.stud_group || (isGeneral ? "General" : prev.group),
          fatherName: student.fatherName || student.fname || prev.fatherName,
          motherName: student.motherName || student.mname || prev.motherName,
          session: student.session || (isGeneral ? "" : `${Number(student.year || 2026) - 1}-${student.year || 2026}`),
          studentClass: String(student.class || searchClass),
          section: student.section || "A",
        }));

        setSearchMessage({
          type: "success",
          text: `শিক্ষার্থী ${student.studentName || student.studentNameEn} এর ফলাফল ও তথ্য সফলভাবে প্রশংসাপত্রে লোড হয়েছে!`,
        });
      } else {
        setSearchMessage({
          type: "error",
          text: `শ্রেণি ${searchClass} এবং রোল ${searchRoll} এর কোনো ডাটাবেস রেকর্ড মেলেনি। আপনি নিচের ফর্মে তথ্য সরাসরি পরিবর্তন করতে পারেন।`,
        });
      }
    } catch (err) {
      console.error("Lookup error:", err);
      setSearchMessage({
        type: "error",
        text: "সার্ভার থেকে ফলাফল আনতে ত্রুটি হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।",
      });
    } finally {
      setSearchingData(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    if (confirm(t("ফর্মের সকল তথ্য রিসেট করতে চান?", "Are you sure you want to reset the form?"))) {
      setData((prev) => ({
        ...(certType === "board" ? DEFAULT_BOARD_DATA : DEFAULT_GENERAL_DATA),
        serialNo: prev.serialNo,
        type: certType,
      }));
    }
  };

  // Auto increment counter on download
  const incrementCounter = async () => {
    try {
      const res = await fetch("/api/testimonial-counter", { method: "POST" });
      const resData = await res.json();
      if (resData && typeof resData.count === "number") {
        const nextFormatted = String(resData.count).padStart(4, "0");
        setData((prev) => ({ ...prev, serialNo: nextFormatted }));
      }
    } catch (e) {
      // Local fallback increment
      const curr = parseInt(data.serialNo, 10) || 1;
      const nextFormatted = String(curr + 1).padStart(4, "0");
      setData((prev) => ({ ...prev, serialNo: nextFormatted }));
    }
  };

  const handleDownloadJpg = async () => {
    const element = document.getElementById("testimonial-certificate");
    if (!element) return;

    setDownloadingJpg(true);
    try {
      const options = {
        quality: 0.98,
        pixelRatio: 2.5,
        backgroundColor: "#ffffff",
        style: {
          margin: "0",
          boxShadow: "none",
        },
      };

      const dataUrl = await toJpeg(element, options);
      const fileName = `Testimonial_${(data.studentName || "student").replace(/[^a-zA-Z0-9_-]/g, "_")}_${data.passYear || "BAHS"}.jpg`;
      const link = document.createElement("a");
      link.download = fileName;
      link.href = dataUrl;
      link.click();

      // Auto increment counter after download
      await incrementCounter();
    } catch (err) {
      console.error("Failed to generate JPG image:", err);
      alert(t("ছবি তৈরি করতে সমস্যা হয়েছে, আবার চেষ্টা করুন।", "Failed to generate image. Please try again."));
    } finally {
      setDownloadingJpg(false);
    }
  };

  const handlePrint = async () => {
    const element = document.getElementById("testimonial-certificate");
    if (!element) return;

    try {
      // Generate ultra high resolution image using html-to-image (same engine as JPG download)
      const dataUrl = await toJpeg(element, {
        quality: 1,
        pixelRatio: 3,
        backgroundColor: "#ffffff",
        style: {
          margin: "0",
          boxShadow: "none",
        },
      });

      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        // Fallback to iframe if popup blocked
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

        doc.open();
        doc.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Testimonial - ${data.studentName || "BAHS"}</title>
              <style>
                @page {
                  size: A4 portrait;
                  margin: 10mm;
                }
                body {
                  margin: 0;
                  padding: 0;
                  display: flex;
                  justify-content: center;
                  align-items: flex-start;
                  background: #fff;
                }
                img {
                  width: 100%;
                  max-width: 190mm;
                  height: auto;
                  display: block;
                }
              </style>
            </head>
            <body>
              <img src="${dataUrl}" onload="window.focus(); window.print();" />
            </body>
          </html>
        `);
        doc.close();

        setTimeout(() => {
          try {
            document.body.removeChild(iframe);
          } catch (e) {}
        }, 3000);
      } else {
        printWindow.document.open();
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Testimonial - ${data.studentName || "BAHS"}</title>
              <style>
                @page {
                  size: A4 portrait;
                  margin: 10mm;
                }
                body {
                  margin: 0;
                  padding: 0;
                  display: flex;
                  justify-content: center;
                  align-items: flex-start;
                  background: #fff;
                }
                img {
                  width: 100%;
                  max-width: 190mm;
                  height: auto;
                  display: block;
                }
              </style>
            </head>
            <body>
              <img src="${dataUrl}" onload="window.focus(); window.print(); window.close();" />
            </body>
          </html>
        `);
        printWindow.document.close();
      }

      // Auto increment serial counter on print
      await incrementCounter();
    } catch (err) {
      console.error("Print error:", err);
      alert(t("প্রিন্ট করতে সমস্যা হয়েছে, আবার চেষ্টা করুন।", "Failed to print certificate. Please try again."));
    }
  };

  const getClassTitle = (cls: string) => {
    switch (cls) {
      case "6": return "Class Six (6th)";
      case "7": return "Class Seven (7th)";
      case "8": return "Class Eight (8th)";
      case "9": return "Class Nine (9th)";
      case "10": return "Class Ten (10th)";
      default: return `Class ${cls}`;
    }
  };

  return (
    <div className={`min-h-screen bg-slate-50 pb-20 ${language === "bn" ? "font-bengali" : "font-sans"}`}>
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#051939] via-[#092b5e] to-[#051939] text-white py-10 shadow-md">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
                <FaCertificate size={15} />
                <span>{t("একাডেমিক সনদ ও প্রশংসাপত্র", "Academic Certificate & Testimonial")}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
                {t("প্রশংসাপত্র তৈরি ও ডাউনলোড", "Generate & Download Testimonial")}
              </h1>
              <p className="text-gray-300 text-xs sm:text-sm mt-2 flex items-center gap-2">
                <Link href="/" className="hover:text-yellow-300 transition-colors">
                  {t("প্রচ্ছদ", "Home")}
                </Link>
                <span>&rsaquo;</span>
                <Link href="/academics/results" className="hover:text-yellow-300 transition-colors">
                  {t("ফলাফল", "Results")}
                </Link>
                <span>&rsaquo;</span>
                <span className="text-yellow-300">{t("প্রশংসাপত্র", "Testimonial")}</span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={handleDownloadJpg}
                disabled={downloadingJpg}
                className="glossy-btn flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl shadow-lg hover:shadow-xl transition cursor-pointer disabled:opacity-50"
              >
                {downloadingJpg ? <FaSpinner className="animate-spin" /> : <FaDownload />}
                <span>{downloadingJpg ? t("JPG তৈরি হচ্ছে...", "Generating JPG...") : t("JPG ইমেজ ডাউনলোড", "Download JPG Image")}</span>
              </button>

              <button
                onClick={handlePrint}
                className="glossy-btn flex items-center gap-2 bg-[#06874A] hover:bg-emerald-600 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl shadow-lg hover:shadow-xl transition cursor-pointer"
              >
                <FaPrint />
                <span>{t("প্রিন্ট করুন", "Print Certificate")}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-5 max-w-6xl">
        {/* IMPORTANT NOTICE: Physical Headmaster Signature and Seal Required */}
        <div className="bg-amber-50 border-2 border-amber-300/90 rounded-2xl p-4 sm:p-5 mb-6 shadow-sm flex items-start gap-3.5">
          <div className="p-2.5 bg-amber-500 text-white rounded-xl shrink-0 mt-0.5 shadow-sm">
            <FaPenNib size={18} />
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base text-amber-950 flex items-center gap-2">
              <span>{t("জরুরি নির্দেশনা: প্রধান শিক্ষকের স্বাক্ষর ও সিল গ্রহণ", "Important Notice: Headmaster Signature & Seal Required")}</span>
              <span className="bg-amber-200 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">অফিশিয়াল নিয়ম</span>
            </h3>
            <p className="text-xs sm:text-sm text-amber-900/90 mt-1 leading-relaxed">
              {t(
                "প্রশংসাপত্র ডাউনলোড বা প্রিন্ট করার পর বিদ্যালয়ের অফিস কক্ষ থেকে প্রধান শিক্ষক মহোদয়ের স্বাক্ষর ও অফিশিয়াল গোল সিল গ্রহণ করতে হবে। প্রধান শিক্ষকের সশরীরে স্বাক্ষর ও সিল ছাড়া এই প্রশংসাপত্র কোনো আনুষ্ঠানিক বা দাপ্তরিক কাজে গ্রহণযোগ্য হবে না।",
                "After printing or downloading this testimonial, you must obtain the Headmaster's physical signature and official school seal from the school office. Without official signature and seal, this certificate is not valid."
              )}
            </p>
          </div>
        </div>

        {/* Certificate Type Switcher (Board vs General School) */}
        <div className="bg-white rounded-2xl p-2 shadow-sm border border-slate-200 mb-6 flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            onClick={() => handleTypeChange("board")}
            className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer ${
              certType === "board"
                ? "bg-[#051939] text-white shadow-md"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <FaAward className={certType === "board" ? "text-yellow-400" : "text-gray-400"} />
            <span>{t("জাতীয় বোর্ড প্রশংসাপত্র (SSC ও JSC)", "National Board Testimonial (SSC & JSC)")}</span>
          </button>

          <button
            type="button"
            onClick={() => handleTypeChange("general")}
            className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer ${
              certType === "general"
                ? "bg-[#06874A] text-white shadow-md"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <FaSchool className={certType === "general" ? "text-white" : "text-gray-400"} />
            <span>{t("সাধারণ শ্রেণি প্রশংসাপত্র (৬ষ্ঠ - ১০ম শ্রেণি)", "General Class Testimonial (Grades 6 - 10)")}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: Input Form (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-5 sm:p-7 shadow-md border border-slate-200">
            {/* Quick Lookup by Class & Roll Banner */}
            <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50 border border-emerald-200/80 rounded-2xl p-4 mb-6 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-emerald-600 text-white rounded-lg">
                  <FaSearch size={13} />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-emerald-950">
                    {t("রোল ও শ্রেণি দিয়ে সরাসরি তথ্য লোড করুন", "Instant Lookup by Class & Roll")}
                  </h3>
                  <p className="text-[11px] text-emerald-700">
                    {t("ফলাফল রেকর্ড থেকে শিক্ষার্থীর নাম, জিপিএ ও তথ্য স্বয়ংক্রিয়ভাবে লোড হবে", "Auto-fetches name, GPA and student data directly from results")}
                  </p>
                </div>
              </div>

              <form onSubmit={handleLookupResult} className="mt-3 flex flex-wrap sm:flex-nowrap items-center gap-2">
                <div className="w-1/3 sm:w-28 shrink-0">
                  <select
                    value={searchClass}
                    onChange={(e) => setSearchClass(e.target.value)}
                    className="w-full bg-white border border-emerald-300 rounded-xl px-2.5 py-2 text-xs font-semibold text-gray-800 focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="6">৬ষ্ঠ শ্রেণি</option>
                    <option value="7">৭ম শ্রেণি</option>
                    <option value="8">৮ম শ্রেণি (JSC)</option>
                    <option value="9">৯ম শ্রেণি</option>
                    <option value="10">১০ম শ্রেণি (SSC)</option>
                  </select>
                </div>

                <div className="flex-1 min-w-[90px]">
                  <input
                    type="text"
                    value={searchRoll}
                    onChange={(e) => setSearchRoll(e.target.value)}
                    placeholder={t("রোল নম্বর...", "Roll No...")}
                    className="w-full bg-white border border-emerald-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={searchingData}
                  className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shrink-0"
                >
                  {searchingData ? (
                    <>
                      <FaSpinner className="animate-spin text-xs" />
                      <span>{t("খোঁজা হচ্ছে...", "Loading...")}</span>
                    </>
                  ) : (
                    <>
                      <FaSearch className="text-xs" />
                      <span>{t("তথ্য আনুন", "Fetch")}</span>
                    </>
                  )}
                </button>
              </form>

              {searchMessage && (
                <div
                  className={`mt-2.5 p-2 rounded-xl text-[11.5px] font-medium flex items-start gap-1.5 ${
                    searchMessage.type === "success"
                      ? "bg-emerald-100/80 text-emerald-900 border border-emerald-300"
                      : "bg-rose-100/80 text-rose-900 border border-rose-300"
                  }`}
                >
                  <FaInfoCircle className="mt-0.5 shrink-0" size={13} />
                  <span>{searchMessage.text}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 text-[#051939] rounded-xl">
                  <FaUserGraduate size={16} />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#051939]">
                    {certType === "board"
                      ? t("বোর্ড প্রশংসাপত্রের তথ্য", "Board Testimonial Info")
                      : t("শ্রেণি প্রশংসাপত্রের তথ্য (৬ষ্ঠ-১০ম)", "General Class Testimonial Info")}
                  </h2>
                  <p className="text-[11px] text-gray-400">
                    {certType === "board"
                      ? t("এসএসসি ও জেএসসি পরীক্ষার রোল, রেজি. ও সেশন প্রযোজ্য", "Roll, Reg No & Session for Board exams")
                      : t("শুধুমাত্র শ্রেণি, রোল ও সেকশন প্রযোজ্য (রেজি/সেশন ছাড়া)", "Only Class, Roll & Section (No Reg/Session)")}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={resetForm}
                className="text-xs text-gray-500 hover:text-red-600 flex items-center gap-1 transition cursor-pointer"
                title="রিসেট"
              >
                <FaUndo size={11} /> {t("রিসেট", "Reset")}
              </button>
            </div>

            <form className="space-y-4 text-xs sm:text-sm" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    ক্রমিক নং (Serial No)
                    <span className="text-[10px] font-normal text-emerald-700 ml-1">● অটো-ইনক্রিমেন্ট</span>
                  </label>
                  <input
                    type="text"
                    name="serialNo"
                    value={data.serialNo}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 font-mono text-sm font-bold text-emerald-800 bg-emerald-50/40 focus:ring-2 focus:ring-[#051939]"
                    placeholder="0001"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">তারিখ (Date)</label>
                  <input
                    type="text"
                    name="date"
                    value={data.date}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 font-mono text-sm focus:ring-2 focus:ring-[#051939]"
                    placeholder="10-05-2018"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">শিক্ষার্থীর নাম (Student's Name) *</label>
                <input
                  type="text"
                  name="studentName"
                  value={data.studentName}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 font-sans font-semibold text-sm focus:ring-2 focus:ring-[#051939]"
                  placeholder="Swadheen Islam Robi"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">পিতার নাম (Father's Name)</label>
                  <input
                    type="text"
                    name="fatherName"
                    value={data.fatherName}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#051939]"
                    placeholder="Abul Hussain"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">মাতার নাম (Mother's Name)</label>
                  <input
                    type="text"
                    name="motherName"
                    value={data.motherName}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#051939]"
                    placeholder="Saleha Begum"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">গ্রাম (Village)</label>
                  <input
                    type="text"
                    name="village"
                    value={data.village}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#051939]"
                    placeholder="Choturongo Rayer para"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">ডাকঘর (Post Office)</label>
                  <input
                    type="text"
                    name="postOffice"
                    value={data.postOffice}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#051939]"
                    placeholder="Baniyachong"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">উপজেলা (Upazilla)</label>
                  <input
                    type="text"
                    name="upazilla"
                    value={data.upazilla}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#051939]"
                    placeholder="Baniyachong"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">জেলা (District)</label>
                  <input
                    type="text"
                    name="district"
                    value={data.district}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#051939]"
                    placeholder="Habiganj"
                  />
                </div>
              </div>

              {/* General class specific fields: Class and Section */}
              {certType === "general" ? (
                <div className="pt-2 border-t border-gray-100">
                  <p className="font-bold text-[#06874A] mb-2 text-xs uppercase tracking-wide">
                    {t("শ্রেণি ও রোল সংক্রান্ত তথ্য (রেজিস্ট্রেশন/সেশন ছাড়া)", "Class & Roll Details (No Reg/Session)")}
                  </p>
                  <div className="grid grid-cols-3 gap-2.5">
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">শ্রেণি (Class)</label>
                      <select
                        name="studentClass"
                        value={data.studentClass}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm font-semibold focus:ring-2 focus:ring-[#06874A]"
                      >
                        <option value="6">৬ষ্ঠ শ্রেণি (Six)</option>
                        <option value="7">৭ম শ্রেণি (Seven)</option>
                        <option value="8">৮ম শ্রেণি (Eight)</option>
                        <option value="9">৯ম শ্রেণি (Nine)</option>
                        <option value="10">১০ম শ্রেণি (Ten)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">শাখা (Section)</label>
                      <input
                        type="text"
                        name="section"
                        value={data.section}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#06874A]"
                        placeholder="ক (A)"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">ক্লাস রোল (Roll No)</label>
                      <input
                        type="text"
                        name="rollNo"
                        value={data.rollNo}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-[#06874A]"
                        placeholder="1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 mt-3">
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">শিক্ষাবর্ষ / সন (Year)</label>
                      <input
                        type="text"
                        name="passYear"
                        value={data.passYear}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-[#06874A]"
                        placeholder="2026"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">প্রাপ্ত G.P.A (যদি থাকে)</label>
                      <input
                        type="text"
                        name="gpa"
                        value={data.gpa}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm font-bold font-mono text-emerald-700 focus:ring-2 focus:ring-[#06874A]"
                        placeholder="5.00"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                /* Board specific fields: Exam, Year, Group, GPA, Roll, Reg, Session */
                <div className="pt-2 border-t border-gray-100">
                  <p className="font-bold text-[#051939] mb-2 text-xs uppercase tracking-wide">
                    {t("বোর্ড পরীক্ষার তথ্য (SSC / JSC)", "Board Examination Details")}
                  </p>
                  <div className="grid grid-cols-3 gap-2.5">
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">পাসের সন (Year)</label>
                      <input
                        type="text"
                        name="passYear"
                        value={data.passYear}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-[#051939]"
                        placeholder="2018"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">বিভাগ (Group)</label>
                      <input
                        type="text"
                        name="group"
                        value={data.group}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#051939]"
                        placeholder="Science"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">G.P.A</label>
                      <input
                        type="text"
                        name="gpa"
                        value={data.gpa}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm font-bold font-mono text-emerald-700 focus:ring-2 focus:ring-[#051939]"
                        placeholder="5.00"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5 mt-3">
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">রোল (Roll No)</label>
                      <input
                        type="text"
                        name="rollNo"
                        value={data.rollNo}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-[#051939]"
                        placeholder="109685"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">রেজিস্ট্রেশন (Reg No)</label>
                      <input
                        type="text"
                        name="regNo"
                        value={data.regNo}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-[#051939]"
                        placeholder="1516747814"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">সেশন (Session)</label>
                      <input
                        type="text"
                        name="session"
                        value={data.session}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-[#051939]"
                        placeholder="2016-2017"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-2 border-t border-gray-100">
                <p className="font-bold text-[#051939] mb-2 text-xs uppercase tracking-wide">
                  {t("জন্মতারিখ", "Date of Birth")}
                </p>
                <div className="grid grid-cols-1 gap-2.5">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">সংখ্যায় (Numeric DD-MM-YYYY)</label>
                    <input
                      type="text"
                      name="dobNumeric"
                      value={data.dobNumeric}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-[#051939]"
                      placeholder="19-11-2001"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">কথায় (In Words)</label>
                    <input
                      type="text"
                      name="dobInWords"
                      value={data.dobInWords}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#051939]"
                      placeholder="Nineteenth November Two Thousand and one."
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="w-full bg-[#051939] hover:bg-[#06874A] text-white py-3 rounded-2xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FaPrint /> {t("প্রশংসাপত্র প্রিন্ট করুন", "Print Testimonial Certificate")}
                </button>
              </div>
            </form>
          </div>

          {/* RIGHT COLUMN: Live Authentic Certificate Preview (7 cols) */}
          <div className="lg:col-span-7 flex flex-col items-center">
            <div className="w-full flex items-center justify-between mb-3 px-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                <FaEye className="text-emerald-600" />
                {certType === "board"
                  ? t("লাইভ বোর্ড প্রশংসাপত্র প্রিভিউ", "Live Board Certificate Preview")
                  : t("লাইভ সাধারণ শ্রেণি প্রশংসাপত্র প্রিভিউ", "Live Class Certificate Preview")}
              </span>
              <span className="text-xs text-gray-400 font-mono">
                Serial: #{data.serialNo} &bull; A4 Portrait
              </span>
            </div>

            {/* Print Container Wrapper with Authentic Border */}
            <div className="w-full overflow-x-auto p-1 pb-6 flex justify-center">
              <div
                id="testimonial-certificate"
                ref={printAreaRef}
                className="bg-white text-gray-900 border-[8px] sm:border-[10px] border-[#184293] p-6 sm:p-8 rounded-sm shadow-2xl relative select-none w-full max-w-[680px]"
                style={{
                  fontFamily: "'Tinos', 'Times New Roman', serif",
                  outline: "2px dashed #0a2566",
                  outlineOffset: "-6px",
                }}
              >
                {/* Vintage Geometric Corners */}
                <div className="absolute top-1 left-1 w-5 h-5 border-2 border-[#184293]" />
                <div className="absolute top-1 right-1 w-5 h-5 border-2 border-[#184293]" />
                <div className="absolute bottom-1 left-1 w-5 h-5 border-2 border-[#184293]" />
                <div className="absolute bottom-1 right-1 w-5 h-5 border-2 border-[#184293]" />

                {/* Top Header */}
                <div className="text-center pt-1 mb-2">
                  <h1
                    className="text-xl sm:text-2xl md:text-[27px] font-black tracking-wider text-[#10377d] uppercase leading-tight"
                    style={{
                      fontFamily: "'Cinzel', 'Playfair Display', serif",
                    }}
                  >
                    Baniyachong Adarsha High School
                  </h1>
                  <p className="text-[11.5px] sm:text-[13px] font-bold text-gray-800 mt-1">
                    P.O: Baniyachong, P.S: Baniyachong, Dist: Habiganj.
                  </p>
                  <p className="text-[10px] sm:text-[11px] font-bold text-gray-700 tracking-wider mt-0.5">
                    EIIN-129344 &nbsp;&bull;&nbsp; ESTD-1985
                  </p>
                </div>

                {/* Serial No, Badge, Date Row */}
                <div className="flex items-center justify-between mt-3 mb-2 px-1 text-xs sm:text-[13.5px] font-bold text-gray-800">
                  <div>
                    Serial No. &nbsp;
                    <span
                      className="font-bold text-sm sm:text-base text-[#0a2566]"
                      style={{ fontFamily: "'Caveat', cursive", fontSize: "20px" }}
                    >
                      {data.serialNo || "0001"}
                    </span>
                  </div>

                  {/* Centered TESTIMONIAL Oval/Curved Badge */}
                  <div
                    className="border-2 border-[#184293] rounded-2xl px-5 py-0.5 text-center text-[#10377d] font-black tracking-widest text-sm sm:text-lg uppercase"
                    style={{ fontFamily: "'Cinzel', serif" }}
                  >
                    TESTIMONIAL
                  </div>

                  <div>
                    Date: &nbsp;
                    <span
                      className="font-bold text-sm sm:text-base text-[#0a2566] underline decoration-dotted"
                      style={{ fontFamily: "'Caveat', cursive", fontSize: "17px" }}
                    >
                      {data.date || "10-05-2018"}
                    </span>
                  </div>
                </div>

                {/* Certificate Main Text Content */}
                {certType === "board" ? (
                  /* BOARD TESTIMONIAL TEXT (SSC / JSC) */
                  <div className="mt-4 text-[13px] sm:text-[14.5px] text-gray-900 leading-[2.1] text-left">
                    <span>This is to Certify that </span>
                    <span
                      className="inline-block font-bold border-b border-dotted border-gray-600 px-1 text-[#0a2566] min-w-[140px] text-center leading-[1.0] translate-y-[-2px]"
                      style={{ fontFamily: "'Caveat', cursive", fontSize: "21px" }}
                    >
                      {data.studentName || "...................................."}
                    </span>
                    <span>, Father's Name </span>
                    <span
                      className="inline-block font-bold border-b border-dotted border-gray-600 px-1 text-[#0a2566] min-w-[140px] text-center leading-[1.0] translate-y-[-2px]"
                      style={{ fontFamily: "'Caveat', cursive", fontSize: "20px" }}
                    >
                      {data.fatherName || "...................................."}
                    </span>
                    <span>, Mother's Name </span>
                    <span
                      className="inline-block font-bold border-b border-dotted border-gray-600 px-1 text-[#0a2566] min-w-[140px] text-center leading-[1.0] translate-y-[-2px]"
                      style={{ fontFamily: "'Caveat', cursive", fontSize: "20px" }}
                    >
                      {data.motherName || "...................................."}
                    </span>
                    <span>, Village </span>
                    <span
                      className="inline-block font-bold border-b border-dotted border-gray-600 px-1 text-[#0a2566] min-w-[80px] text-center leading-[1.0] translate-y-[-2px]"
                      style={{ fontFamily: "'Caveat', cursive", fontSize: "19px" }}
                    >
                      {data.village || "................"}
                    </span>
                    <span>, Post Office </span>
                    <span
                      className="inline-block font-bold border-b border-dotted border-gray-600 px-1 text-[#0a2566] min-w-[80px] text-center leading-[1.0] translate-y-[-2px]"
                      style={{ fontFamily: "'Caveat', cursive", fontSize: "19px" }}
                    >
                      {data.postOffice || "................"}
                    </span>
                    <span>, Upazilla </span>
                    <span
                      className="inline-block font-bold border-b border-dotted border-gray-600 px-1 text-[#0a2566] min-w-[70px] text-center leading-[1.0] translate-y-[-2px]"
                      style={{ fontFamily: "'Caveat', cursive", fontSize: "19px" }}
                    >
                      {data.upazilla || "................"}
                    </span>
                    <span>, District </span>
                    <span
                      className="inline-block font-bold border-b border-dotted border-gray-600 px-1 text-[#0a2566] min-w-[70px] text-center leading-[1.0] translate-y-[-2px]"
                      style={{ fontFamily: "'Caveat', cursive", fontSize: "19px" }}
                    >
                      {data.district || "................"}
                    </span>
                    <span> was a student of this School. </span>
                    <span>He/She passed the Secondary School Certificate Examination under the Board of Intermediate and Secondary Education , Sylhet with G.P.A </span>
                    <span
                      className="inline-block font-bold border-b border-dotted border-gray-600 px-1 text-[#0a2566] min-w-[45px] text-center leading-[1.0] translate-y-[-2px]"
                      style={{ fontFamily: "'Caveat', cursive", fontSize: "21px" }}
                    >
                      {data.gpa || "5.00"}
                    </span>
                    <span> in the year </span>
                    <span
                      className="inline-block font-bold border-b border-dotted border-gray-600 px-1 text-[#0a2566] min-w-[45px] text-center leading-[1.0] translate-y-[-2px]"
                      style={{ fontFamily: "'Caveat', cursive", fontSize: "20px" }}
                    >
                      {data.passYear || "2018"}
                    </span>
                    <span> in </span>
                    <span
                      className="inline-block font-bold border-b border-dotted border-gray-600 px-1 text-[#0a2566] min-w-[65px] text-center leading-[1.0] translate-y-[-2px]"
                      style={{ fontFamily: "'Caveat', cursive", fontSize: "20px" }}
                    >
                      {data.group || "Science"}
                    </span>
                    <span> Group from this School. His/Her Examination Roll No. was Baniya </span>
                    <span
                      className="inline-block font-bold border-b border-dotted border-gray-600 px-1 text-[#0a2566] min-w-[65px] text-center leading-[1.0] translate-y-[-2px]"
                      style={{ fontFamily: "'Caveat', cursive", fontSize: "20px" }}
                    >
                      {data.rollNo || "109685"}
                    </span>
                    <span>, Reg.No. </span>
                    <span
                      className="inline-block font-bold border-b border-dotted border-gray-600 px-1 text-[#0a2566] min-w-[85px] text-center leading-[1.0] translate-y-[-2px]"
                      style={{ fontFamily: "'Caveat', cursive", fontSize: "20px" }}
                    >
                      {data.regNo || "1516747814"}
                    </span>
                    <span> of session </span>
                    <span
                      className="inline-block font-bold border-b border-dotted border-gray-600 px-1 text-[#0a2566] min-w-[75px] text-center leading-[1.0] translate-y-[-2px]"
                      style={{ fontFamily: "'Caveat', cursive", fontSize: "20px" }}
                    >
                      {data.session || "2016-2017"}
                    </span>
                    <span>. His/Her Date of birth is </span>
                    <span
                      className="inline-block font-bold border-b border-dotted border-gray-600 px-1 text-[#0a2566] min-w-[80px] text-center leading-[1.0] translate-y-[-2px]"
                      style={{ fontFamily: "'Caveat', cursive", fontSize: "20px" }}
                    >
                      {data.dobNumeric || "19-11-2001"}
                    </span>
                    <span> in words (</span>
                    <span
                      className="inline-block font-bold border-b border-dotted border-gray-600 px-1 text-[#0a2566] leading-[1.0] translate-y-[-2px]"
                      style={{ fontFamily: "'Caveat', cursive", fontSize: "18.5px" }}
                    >
                      {data.dobInWords || "Nineteenth November Two Thousand and one."}
                    </span>
                    <span>)</span>

                    <p className="mt-4 leading-relaxed">
                      To the best of my knowledge, he/she bears a good moral character and did not take part in any activities subversive of the state or school discipline.
                    </p>
                    <p className="mt-1">
                      I wish him/her every success in life.
                    </p>
                  </div>
                ) : (
                  /* GENERAL CLASS TESTIMONIAL TEXT (6th to 10th - No Reg / Session) */
                  <div className="mt-4 text-[13px] sm:text-[14.5px] text-gray-900 leading-[2.1] text-left">
                    <span>This is to Certify that </span>
                    <span
                      className="inline-block font-bold border-b border-dotted border-gray-600 px-1 text-[#0a2566] min-w-[140px] text-center leading-[1.0] translate-y-[-2px]"
                      style={{ fontFamily: "'Caveat', cursive", fontSize: "21px" }}
                    >
                      {data.studentName || "...................................."}
                    </span>
                    <span>, Father's Name </span>
                    <span
                      className="inline-block font-bold border-b border-dotted border-gray-600 px-1 text-[#0a2566] min-w-[140px] text-center leading-[1.0] translate-y-[-2px]"
                      style={{ fontFamily: "'Caveat', cursive", fontSize: "20px" }}
                    >
                      {data.fatherName || "...................................."}
                    </span>
                    <span>, Mother's Name </span>
                    <span
                      className="inline-block font-bold border-b border-dotted border-gray-600 px-1 text-[#0a2566] min-w-[140px] text-center leading-[1.0] translate-y-[-2px]"
                      style={{ fontFamily: "'Caveat', cursive", fontSize: "20px" }}
                    >
                      {data.motherName || "...................................."}
                    </span>
                    <span>, Village </span>
                    <span
                      className="inline-block font-bold border-b border-dotted border-gray-600 px-1 text-[#0a2566] min-w-[80px] text-center leading-[1.0] translate-y-[-2px]"
                      style={{ fontFamily: "'Caveat', cursive", fontSize: "19px" }}
                    >
                      {data.village || "................"}
                    </span>
                    <span>, Post Office </span>
                    <span
                      className="inline-block font-bold border-b border-dotted border-gray-600 px-1 text-[#0a2566] min-w-[80px] text-center leading-[1.0] translate-y-[-2px]"
                      style={{ fontFamily: "'Caveat', cursive", fontSize: "19px" }}
                    >
                      {data.postOffice || "................"}
                    </span>
                    <span>, Upazilla </span>
                    <span
                      className="inline-block font-bold border-b border-dotted border-gray-600 px-1 text-[#0a2566] min-w-[70px] text-center leading-[1.0] translate-y-[-2px]"
                      style={{ fontFamily: "'Caveat', cursive", fontSize: "19px" }}
                    >
                      {data.upazilla || "................"}
                    </span>
                    <span>, District </span>
                    <span
                      className="inline-block font-bold border-b border-dotted border-gray-600 px-1 text-[#0a2566] min-w-[70px] text-center leading-[1.0] translate-y-[-2px]"
                      style={{ fontFamily: "'Caveat', cursive", fontSize: "19px" }}
                    >
                      {data.district || "................"}
                    </span>
                    <span> is/was a bonafide student of this School. </span>
                    <span>He/She has successfully studied in </span>
                    <span
                      className="inline-block font-bold border-b border-dotted border-gray-600 px-1 text-[#0a2566] min-w-[60px] text-center leading-[1.0] translate-y-[-2px]"
                      style={{ fontFamily: "'Caveat', cursive", fontSize: "20px" }}
                    >
                      {getClassTitle(data.studentClass || "8")}
                    </span>
                    <span>, Section </span>
                    <span
                      className="inline-block font-bold border-b border-dotted border-gray-600 px-1 text-[#0a2566] min-w-[35px] text-center leading-[1.0] translate-y-[-2px]"
                      style={{ fontFamily: "'Caveat', cursive", fontSize: "20px" }}
                    >
                      {data.section || "A"}
                    </span>
                    <span>, with Class Roll No. </span>
                    <span
                      className="inline-block font-bold border-b border-dotted border-gray-600 px-1 text-[#0a2566] min-w-[40px] text-center leading-[1.0] translate-y-[-2px]"
                      style={{ fontFamily: "'Caveat', cursive", fontSize: "20px" }}
                    >
                      {data.rollNo || "1"}
                    </span>
                    <span> in the academic year </span>
                    <span
                      className="inline-block font-bold border-b border-dotted border-gray-600 px-1 text-[#0a2566] min-w-[50px] text-center leading-[1.0] translate-y-[-2px]"
                      style={{ fontFamily: "'Caveat', cursive", fontSize: "20px" }}
                    >
                      {data.passYear || "2026"}
                    </span>
                    {data.gpa && (
                      <>
                        <span> obtaining G.P.A </span>
                        <span
                          className="inline-block font-bold border-b border-dotted border-gray-600 px-1 text-[#0a2566] min-w-[45px] text-center leading-[1.0] translate-y-[-2px]"
                          style={{ fontFamily: "'Caveat', cursive", fontSize: "21px" }}
                        >
                          {data.gpa}
                        </span>
                      </>
                    )}
                    <span>. His/Her Date of birth is </span>
                    <span
                      className="inline-block font-bold border-b border-dotted border-gray-600 px-1 text-[#0a2566] min-w-[80px] text-center leading-[1.0] translate-y-[-2px]"
                      style={{ fontFamily: "'Caveat', cursive", fontSize: "20px" }}
                    >
                      {data.dobNumeric || "12-04-2011"}
                    </span>
                    <span> in words (</span>
                    <span
                      className="inline-block font-bold border-b border-dotted border-gray-600 px-1 text-[#0a2566] leading-[1.0] translate-y-[-2px]"
                      style={{ fontFamily: "'Caveat', cursive", fontSize: "18.5px" }}
                    >
                      {data.dobInWords || "Twelfth April Two Thousand and Eleven."}
                    </span>
                    <span>)</span>

                    <p className="mt-4 leading-relaxed">
                      To the best of my knowledge, he/she bears a good moral character and did not take part in any activities subversive of the state or school discipline.
                    </p>
                    <p className="mt-1">
                      I wish him/her every success and a bright future in life.
                    </p>
                  </div>
                )}

                {/* Headmaster Signature & Seal Section (Kept blank for official signing & seal) */}
                <div className="mt-12 flex justify-end">
                  <div className="text-center min-w-[200px]">
                    {/* Blank space for physical headmaster signature and round official seal */}
                    <div className="h-16"></div>
                    <div className="border-t-[1.5px] border-gray-800 pt-1.5">
                      <p
                        className="text-[16px] font-bold text-[#10377d] italic leading-tight"
                        style={{ fontFamily: "'Playfair Display', serif" }}
                      >
                        Headmaster
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Print & Image Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
              <button
                onClick={handleDownloadJpg}
                disabled={downloadingJpg}
                className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-5 py-2.5 rounded-xl shadow-md transition flex items-center gap-2 text-sm cursor-pointer disabled:opacity-50"
              >
                {downloadingJpg ? <FaSpinner className="animate-spin" /> : <FaDownload />}
                <span>{downloadingJpg ? t("JPG তৈরি হচ্ছে...", "Generating JPG...") : t("JPG ইমেজ সংরক্ষণ", "Save as JPG Image")}</span>
              </button>

              <button
                onClick={handlePrint}
                className="bg-[#06874A] hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl shadow-md transition flex items-center gap-2 text-sm cursor-pointer"
              >
                <FaPrint /> {t("সরাসরি প্রিন্ট করুন", "Direct Print")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
