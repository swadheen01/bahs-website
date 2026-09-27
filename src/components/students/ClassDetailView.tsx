"use client";
import { useState, useEffect } from "react";
import initialSchoolInfo from "@/data/school-info.json";
import Link from "next/link";
import {
  FaGraduationCap,
  FaChalkboardTeacher,
  FaUsers,
  FaDoorOpen,
  FaBook,
  FaCalendarAlt,
  FaDownload,
  FaCheckCircle,
  FaPhoneAlt,
  FaClock,
  FaInfoCircle,
  FaLayerGroup,
} from "react-icons/fa";
import { useLanguage } from "@/lib/LanguageContext";

interface Props {
  classNum: number;
}

const classThemes: Record<
  number,
  {
    bgGradient: string;
    borderAccent: string;
    badgeBg: string;
    buttonColor: string;
  }
> = {
  6: {
    bgGradient: "from-emerald-700 via-teal-800 to-cyan-900",
    borderAccent: "border-emerald-500",
    badgeBg: "bg-emerald-500/20 text-emerald-200 border-emerald-400/30",
    buttonColor: "bg-emerald-600 hover:bg-emerald-700",
  },
  7: {
    bgGradient: "from-blue-700 via-indigo-800 to-violet-900",
    borderAccent: "border-blue-500",
    badgeBg: "bg-blue-500/20 text-blue-200 border-blue-400/30",
    buttonColor: "bg-blue-600 hover:bg-blue-700",
  },
  8: {
    bgGradient: "from-purple-700 via-fuchsia-800 to-pink-900",
    borderAccent: "border-purple-500",
    badgeBg: "bg-purple-500/20 text-purple-200 border-purple-400/30",
    buttonColor: "bg-purple-600 hover:bg-purple-700",
  },
  9: {
    bgGradient: "from-amber-700 via-orange-800 to-red-900",
    borderAccent: "border-amber-500",
    badgeBg: "bg-amber-500/20 text-amber-200 border-amber-400/30",
    buttonColor: "bg-amber-600 hover:bg-amber-700",
  },
  10: {
    bgGradient: "from-rose-800 via-red-800 to-rose-950",
    borderAccent: "border-rose-500",
    badgeBg: "bg-rose-500/20 text-rose-200 border-rose-400/30",
    buttonColor: "bg-rose-600 hover:bg-rose-700",
  },
};

export default function ClassDetailView({ classNum }: Props) {
  const { t, language } = useLanguage();
  const [classesData, setClassesData] = useState<any[]>(initialSchoolInfo.classes || []);
  const [selectedSectionIdx, setSelectedSectionIdx] = useState<number>(0);

  useEffect(() => {
    fetch("/api/school-info")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.classes && Array.isArray(data.classes)) {
          setClassesData(data.classes);
        }
      })
      .catch(() => {});
  }, []);

  const classInfo =
    classesData.find((c) => c.num === classNum) ||
    initialSchoolInfo.classes.find((c) => c.num === classNum) ||
    initialSchoolInfo.classes[0];

  const theme = classThemes[classNum] || classThemes[6];

  const classNameText =
    language === "en"
      ? classInfo.nameEn || `Class ${classNum}`
      : classInfo.nameBn || `${classNum}ষ্ঠ শ্রেণি`;

  // Section handling
  const sections =
    Array.isArray(classInfo.sections) && classInfo.sections.length > 0
      ? classInfo.sections
      : [
          {
            name: "ক শাখা",
            nameEn: "Section A",
            classTeacher: classInfo.classTeacher,
            classTeacherEn: classInfo.classTeacherEn,
            teacherPhone: classInfo.teacherPhone,
            room: classInfo.room,
            students: classInfo.students,
            studentsEn: classInfo.studentsEn,
          },
        ];

  const currentSection = sections[selectedSectionIdx] || sections[0];

  const teacherName =
    language === "en"
      ? currentSection.classTeacherEn || currentSection.classTeacher || "Not Assigned"
      : currentSection.classTeacher || "নির্ধারিত শিক্ষক";

  const teacherPhone = currentSection.teacherPhone || classInfo.teacherPhone;
  const currentRoom = currentSection.room || classInfo.room || "১০১";
  const sectionStudents =
    language === "en"
      ? currentSection.studentsEn || currentSection.students
      : currentSection.students;

  const routine = classInfo.routine || [
    { period: "১ম পিরিয়ড", time: "১০:০০ - ১০:৪৫", subject: "বাংলা" },
    { period: "২য় পিরিয়ড", time: "১০:৪৫ - ১১:৩০", subject: "English" },
    { period: "৩য় পিরিয়ড", time: "১১:৩০ - ১২:১৫", subject: "গণিত" },
    { period: "বিরতি (টিফিন)", time: "১২:১৫ - ০১:০০", subject: "নামাজ ও টিফিন" },
    { period: "৪র্থ পিরিয়ড", time: "০১:০০ - ০১:৪৫", subject: "বিজ্ঞান" },
    { period: "৫ম পিরিয়ড", time: "০১:৪৫ - ০২:৩০", subject: "ইতিহাস ও সমাজ" },
    { period: "৬ষ্ঠ পিরিয়ড", time: "০২:৩০ - ০৩:১৫", subject: "ডিজিটাল প্রযুক্তি" },
  ];

  const subjects =
    Array.isArray(classInfo.subjects) && classInfo.subjects.length > 0
      ? classInfo.subjects
      : [
          "বাংলা",
          "English",
          "গণিত",
          "বিজ্ঞান",
          "ইতিহাস ও সামাজিক বিজ্ঞান",
          "ডিজিটাল প্রযুক্তি",
          "ধর্ম ও নৈতিক শিক্ষা",
        ];

  return (
    <div className={`min-h-screen bg-gray-50 pb-20 ${language === "bn" ? "font-bengali" : "font-sans"}`}>
      {/* Hero Banner with Dynamic Gradient */}
      <div className={`bg-gradient-to-r ${theme.bgGradient} text-white py-12 shadow-lg relative overflow-hidden`}>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${theme.badgeBg} uppercase tracking-wider`}>
                  {t("একাডেমিক তথ্য — শিক্ষাবর্ষ ২০২৬", "Academic Information — Session 2026")}
                </span>
                <span className="text-xs text-gray-300 font-sans">EIIN: 129344</span>
              </div>
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
                {classNameText}
              </h1>
              <p className="text-gray-200 text-xs sm:text-sm mt-2 flex items-center gap-2">
                <Link href="/" className="hover:text-yellow-300 transition-colors">
                  {t("প্রচ্ছদ", "Home")}
                </Link>
                <span>&rsaquo;</span>
                <span>{t("শিক্ষার্থী কর্নার", "Students Corner")}</span>
                <span>&rsaquo;</span>
                <span className="text-yellow-300 font-bold">{classNameText}</span>
              </p>
            </div>

            {/* Quick Switch Class Badges */}
            <div className="flex items-center gap-2 bg-black/25 backdrop-blur-md p-2 rounded-2xl border border-white/10">
              <span className="text-xs text-gray-300 font-bold px-2 hidden sm:inline">
                {t("অন্যান্য শ্রেণি:", "Other Classes:")}
              </span>
              {[6, 7, 8, 9, 10].map((num) => (
                <Link
                  key={num}
                  href={`/students/class-${num}`}
                  className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${
                    num === classNum
                      ? "bg-white text-[#051939] shadow-md scale-110"
                      : "text-white/80 hover:bg-white/20 hover:text-white"
                  }`}
                >
                  {num}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-6 max-w-6xl space-y-8 relative z-20">
        {/* Dynamic Section Dropdown Selector Card */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xl border border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-lg shrink-0">
              <FaLayerGroup />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-[#051939] text-base sm:text-lg">
                  {t("শাখা / বিভাগ নির্বাচন করুন", "Select Section / Group")}
                </h3>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  {sections.length} {t("টি শাখা", "Sections")}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                {t(
                  "শাখা পরিবর্তন করলে উক্ত শাখার শ্রেণি শিক্ষক, যোগাযোগ ও নির্ধারিত কক্ষ নম্বর স্বয়ংক্রিয়ভাবে পরিবর্তিত হবে।",
                  "Selecting a section switches the designated class teacher, room, and contact info."
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedSectionIdx}
              onChange={(e) => setSelectedSectionIdx(Number(e.target.value))}
              className="w-full sm:w-64 border-2 border-emerald-600/50 rounded-2xl p-3 text-sm font-extrabold bg-emerald-50/30 text-[#051939] shadow-sm focus:outline-none focus:border-emerald-600 cursor-pointer"
            >
              {sections.map((sec: any, idx: number) => (
                <option key={idx} value={idx}>
                  {language === "en" ? sec.nameEn || sec.name : sec.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Top 4 Quick Metric Cards (Reactively updated per section) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Card 1: Students */}
          <div className="bg-white rounded-2xl p-5 shadow-md border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl shrink-0">
              <FaUsers />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-bold">{t("শাখার শিক্ষার্থী", "Section Students")}</p>
              <h3 className="text-xl font-extrabold text-[#051939]">
                {sectionStudents}
              </h3>
              <span className="text-[10px] text-gray-400 block">
                {t("শ্রেণির মোট:", "Total Class:")} {classInfo.students}
              </span>
            </div>
          </div>

          {/* Card 2: Current Selected Section */}
          <div className="bg-white rounded-2xl p-5 shadow-md border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl shrink-0">
              <FaGraduationCap />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-bold">{t("নির্বাচিত শাখা", "Active Section")}</p>
              <h3 className="text-base font-extrabold text-[#06874A] truncate">
                {language === "en" ? currentSection.nameEn || currentSection.name : currentSection.name}
              </h3>
            </div>
          </div>

          {/* Card 3: Room */}
          <div className="bg-white rounded-2xl p-5 shadow-md border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-xl shrink-0">
              <FaDoorOpen />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-bold">{t("নির্ধারিত কক্ষ নং", "Room Number")}</p>
              <h3 className="text-xl font-extrabold text-[#051939]">
                {currentRoom}
              </h3>
            </div>
          </div>

          {/* Card 4: Class Teacher */}
          <div className="bg-white rounded-2xl p-5 shadow-md border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center text-xl shrink-0">
              <FaChalkboardTeacher />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-500 font-bold">{t("শাখা শ্রেণি শিক্ষক", "Class Teacher")}</p>
              <h3 className="text-sm font-extrabold text-[#051939] truncate" title={teacherName}>
                {teacherName}
              </h3>
            </div>
          </div>
        </div>

        {/* Class Teacher Detailed Card & Routine Table */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Class Teacher Profile (1 Col) */}
          <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <FaChalkboardTeacher size={20} />
                </span>
                <div>
                  <h3 className="font-bold text-[#051939] text-base">{t("শ্রেণি শিক্ষক পরিচিতি", "Class Teacher")}</h3>
                  <p className="text-xs text-gray-500">
                    {classNameText} ({currentSection.name})
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                {currentSection.name}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200/80 space-y-2">
              <p className="text-base font-extrabold text-[#051939]">{teacherName}</p>
              <p className="text-xs text-gray-600 font-medium">
                {t("বানিয়াচং আদর্শ উচ্চ বিদ্যালয়", "Baniyachong Adarsha High School")}
              </p>
              <p className="text-xs text-emerald-700 font-semibold">
                {t("দায়িত্বপ্রাপ্ত শ্রেণি শিক্ষক —", "Assigned Class Teacher —")} {currentSection.name}
              </p>
              {teacherPhone && (
                <div className="pt-2 flex items-center gap-2 text-xs font-bold text-emerald-700 border-t border-gray-200">
                  <FaPhoneAlt size={12} />
                  <a href={`tel:${teacherPhone}`} className="hover:underline font-mono">
                    {teacherPhone}
                  </a>
                </div>
              )}
            </div>

            {/* Description / Special Focus */}
            {classInfo.description && (
              <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200/60 text-xs text-blue-900 leading-relaxed">
                <p className="font-bold mb-1 flex items-center gap-1.5 text-blue-800">
                  <FaInfoCircle /> {t("শ্রেণির বিশেষ নির্দেশনা", "Class Focus")}
                </p>
                {classInfo.description}
              </div>
            )}
          </div>

          {/* Class Routine Table (2 Cols) */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-[#051939] to-[#092b5e] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FaClock className="text-yellow-400" />
                <h3 className="font-bold text-base md:text-lg">
                  {t("দৈনিক ক্লাসের সময়সূচি / রুটিন", "Daily Class Routine")}
                </h3>
              </div>
              <span className="text-xs bg-white/20 px-3 py-1 rounded-full font-bold">
                {t("সকাল ১০:০০ - বিকাল ৩:১৫", "10:00 AM - 3:15 PM")}
              </span>
            </div>

            <div className="p-4 overflow-x-auto">
              <table className="w-full text-xs sm:text-sm text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100 text-[#051939] uppercase font-bold border-b border-gray-200">
                    <th className="py-3 px-4">{t("পিরিয়ড", "Period")}</th>
                    <th className="py-3 px-4">{t("সময়", "Time")}</th>
                    <th className="py-3 px-4">{t("বিষয়", "Subject")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {routine.map((slot: any, idx: number) => {
                    const isTiffin = slot.period.includes("টিফিন") || slot.subject.includes("টিফিন");
                    return (
                      <tr
                        key={idx}
                        className={isTiffin ? "bg-amber-50/70 font-bold text-amber-900" : "hover:bg-gray-50"}
                      >
                        <td className="py-3 px-4 font-semibold text-[#051939]">{slot.period}</td>
                        <td className="py-3 px-4 text-gray-600 font-mono text-xs">{slot.time}</td>
                        <td className="py-3 px-4 font-bold text-emerald-800">{slot.subject}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Subjects & NCTB Book Download */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-4">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center">
                <FaBook size={20} />
              </span>
              <div>
                <h3 className="font-bold text-lg text-[#051939]">
                  {t("পাঠ্য বিষয় ও বইয়ের তালিকা", "Core Subjects & Textbooks")}
                </h3>
                <p className="text-xs text-gray-500">
                  {t("জাতীয় শিক্ষাক্রম ও পাঠ্যপুস্তক বোর্ড (NCTB) অনুমোদিত পাঠ্যবই — ২০২৬", "NCTB Approved Curriculum — 2026")}
                </p>
              </div>
            </div>

            <a
              href={classInfo.nctbLink || "https://nctb.gov.bd"}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-2 ${theme.buttonColor} text-white font-bold px-4 py-2 rounded-xl text-xs shadow-md transition`}
            >
              <FaDownload />
              <span>{t("NCTB পাঠ্যবই ডাউনলোড করুন", "Download NCTB Textbooks")}</span>
            </a>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {subjects.map((sub: string, i: number) => (
              <div
                key={i}
                className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-50 border border-gray-200 hover:border-[#06874A] hover:bg-emerald-50/30 transition group"
              >
                <FaCheckCircle className="text-[#06874A] shrink-0 text-sm group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-gray-800 group-hover:text-[#06874A] transition-colors truncate">
                  {sub}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Student Code of Conduct */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
          <h3 className="font-bold text-base text-[#051939] mb-4 flex items-center gap-2">
            <FaCheckCircle className="text-[#06874A]" />
            {t("শ্রেণিকক্ষের নিয়মাবলি ও আচরণবিধি ২০২৬", "Classroom Code of Conduct 2026")}
          </h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-gray-700">
            <li className="flex items-start gap-2 p-2.5 rounded-lg bg-gray-50">
              <span className="text-[#06874A] font-bold">১.</span>
              <span>প্রতিদিন নির্ধারিত স্কুল ড্রেস পরিধান করে সকাল ৯:৪৫ মিনিটের মধ্যে বিদ্যালয়ে উপস্থিত হতে হবে।</span>
            </li>
            <li className="flex items-start gap-2 p-2.5 rounded-lg bg-gray-50">
              <span className="text-[#06874A] font-bold">২.</span>
              <span>প্রতিদিন সকালের সমাবেশ (অ্যাসেম্বলি) ও জাতীয় সংগীতে বাধ্যতামূলকভাবে অংশগ্রহণ করতে হবে।</span>
            </li>
            <li className="flex items-start gap-2 p-2.5 rounded-lg bg-gray-50">
              <span className="text-[#06874A] font-bold">৩.</span>
              <span>শ্রেণিকক্ষে মোবাইল ফোন বা যেকোনো প্রকার ইলেকট্রনিক ডিভাইস বহন সম্পূর্ণ নিষিদ্ধ।</span>
            </li>
            <li className="flex items-start gap-2 p-2.5 rounded-lg bg-gray-50">
              <span className="text-[#06874A] font-bold">৪.</span>
              <span>মাসিক অন্তত ৮০% উপস্থিতি নিশ্চিত করতে হবে এবং শ্রেণি শিক্ষকের অনুমতি ছাড়া অনুপস্থিত থাকা যাবে না।</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
