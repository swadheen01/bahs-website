"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import initialRoutines from "@/data/routines.json";
import {
  FaClock,
  FaCalendarAlt,
  FaDownload,
  FaPrint,
  FaFilePdf,
  FaCheckCircle,
  FaSchool,
  FaChalkboardTeacher,
} from "react-icons/fa";
import { useLanguage } from "@/lib/LanguageContext";
import { safeDownloadFile } from "@/lib/downloadFile";

export default function ClassRoutinePage() {
  const { t, language } = useLanguage();
  const [selectedClass, setSelectedClass] = useState<string>("6");
  const [routinesData, setRoutinesData] = useState<any>(initialRoutines);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/routines")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.weeklyRoutines) {
          setRoutinesData(data);
        }
      })
      .catch(() => {});
  }, []);

  const currentRoutine =
    routinesData?.weeklyRoutines?.[selectedClass] ||
    initialRoutines.weeklyRoutines[selectedClass as keyof typeof initialRoutines.weeklyRoutines] ||
    [];

  const routineFiles = routinesData?.routineFiles || initialRoutines.routineFiles || [];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={`min-h-screen bg-gray-50 pb-20 ${language === "bn" ? "font-bengali" : "font-sans"}`}>
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-[#051939] via-[#092b5e] to-[#051939] text-white py-12 shadow-md">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
            <FaClock size={16} />
            <span>{t("একাডেমিক সময়সূচি", "Academic Schedule")}</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">
            {t("শ্রেণিভিত্তিক ক্লাস রুটিন ২০২৬", "Class Routine & Timetable 2026")}
          </h1>
          <p className="text-gray-300 text-xs sm:text-sm mt-2 flex items-center gap-2">
            <Link href="/" className="hover:text-yellow-300 transition-colors">
              {t("প্রচ্ছদ", "Home")}
            </Link>
            <span>&rsaquo;</span>
            <span>{t("একাডেমিক", "Academics")}</span>
            <span>&rsaquo;</span>
            <span className="text-yellow-300 font-bold">{t("ক্লাস রুটিন", "Class Routine")}</span>
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-6 max-w-6xl space-y-8 relative z-10">
        {/* PDF Download Cards (Uploaded by Admin) */}
        {routineFiles.length > 0 && (
          <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-100 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-base sm:text-lg font-bold text-[#051939] flex items-center gap-2">
                <FaFilePdf className="text-red-500" />
                {t("অফিসিয়াল ক্লাস রুটিন ডাউনলোড (PDF / ফাইল)", "Official Routine Downloads (PDF / Files)")}
              </h2>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full">
                {t("হালনাগাদ সংস্করণ", "Updated Version")}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {routineFiles.map((file: any) => (
                <div
                  key={file.id}
                  className="p-4 rounded-2xl bg-gray-50 border border-gray-200 hover:border-emerald-500 hover:shadow-md transition flex flex-col justify-between"
                >
                  <div className="space-y-1 mb-3">
                    <span className="text-[10px] font-bold text-gray-500 uppercase">
                      {file.class === "all" ? t("সকল শ্রেণি", "All Classes") : `${file.class}ম শ্রেণি`} • {file.year}
                    </span>
                    <h3 className="text-sm font-bold text-[#051939] line-clamp-2">
                      {language === "en" ? file.titleEn || file.title : file.title}
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => safeDownloadFile(file.fileUrl, `${file.title}_Routine`)}
                    className="inline-flex items-center justify-center gap-2 bg-[#06874A] hover:bg-green-700 text-white font-bold py-2 px-3 rounded-xl text-xs shadow transition cursor-pointer"
                  >
                    <FaDownload size={12} />
                    <span>{t("রুটিন ডাউনলোড করুন", "Download Routine")}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Weekly Routine Interactive Table Section */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden printable-routine">
          {/* Header Controls */}
          <div className="bg-gradient-to-r from-[#051939] via-[#092b5e] to-[#051939] text-white p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-1">
                {t("সাপ্তাহিক ক্লাসের সময়সূচি", "Weekly Class Routine")}
              </span>
              <h2 className="text-xl sm:text-2xl font-black">
                {selectedClass}ষ্ঠ/ম শ্রেণির পূর্ণাঙ্গ সাপ্তাহিক রুটিন
              </h2>
              <p className="text-xs text-gray-300 mt-1">
                {t(
                  "রবিবার থেকে বৃহস্পতিবার — সকাল ১০:০০ টা থেকে বিকাল ৪:৩০ টা পর্যন্ত",
                  "Sunday to Thursday — 10:00 AM to 4:30 PM"
                )}
              </p>
            </div>

            <div className="no-print flex items-center gap-3">
              <button
                onClick={handlePrint}
                className="bg-white/20 hover:bg-white/30 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 border border-white/30 transition cursor-pointer"
              >
                <FaPrint />
                <span>{t("রুটিন প্রিন্ট করুন", "Print Routine")}</span>
              </button>
            </div>
          </div>

          {/* Class Select Tabs */}
          <div className="no-print p-4 bg-gray-50 border-b border-gray-200 flex flex-wrap items-center justify-center gap-2">
            {[
              { num: "6", labelBn: "৬ষ্ঠ শ্রেণি", labelEn: "Class 6" },
              { num: "7", labelBn: "৭ম শ্রেণি", labelEn: "Class 7" },
              { num: "8", labelBn: "৮ম শ্রেণি", labelEn: "Class 8" },
              { num: "9", labelBn: "৯ম শ্রেণি", labelEn: "Class 9" },
              { num: "10", labelBn: "১০ম শ্রেণি", labelEn: "Class 10" },
            ].map((cls) => (
              <button
                key={cls.num}
                onClick={() => setSelectedClass(cls.num)}
                className={`py-2 px-5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                  selectedClass === cls.num
                    ? "bg-[#06874A] text-white shadow-md scale-105"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                {language === "en" ? cls.labelEn : cls.labelBn}
              </button>
            ))}
          </div>

          {/* Routine Table */}
          <div className="p-4 sm:p-6 overflow-x-auto">
            <table className="w-full text-xs sm:text-sm text-left border-collapse border border-gray-200">
              <thead>
                <tr className="bg-[#051939] text-white uppercase text-xs">
                  <th className="py-3 px-3 border border-gray-700 text-center">{t("পিরিয়ড", "Period")}</th>
                  <th className="py-3 px-3 border border-gray-700 text-center">{t("সময়", "Time")}</th>
                  <th className="py-3 px-3 border border-gray-700 text-center">{t("রবিবার", "Sun")}</th>
                  <th className="py-3 px-3 border border-gray-700 text-center">{t("সোমবার", "Mon")}</th>
                  <th className="py-3 px-3 border border-gray-700 text-center">{t("মঙ্গলবার", "Tue")}</th>
                  <th className="py-3 px-3 border border-gray-700 text-center">{t("বুধবার", "Wed")}</th>
                  <th className="py-3 px-3 border border-gray-700 text-center">{t("বৃহস্পতিবার", "Thu")}</th>
                  <th className="py-3 px-3 border border-gray-700 text-center">{t("কক্ষ", "Room")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {currentRoutine.map((slot: any, idx: number) => {
                  const isBreak = slot.period.includes("টিফিন") || slot.period.includes("বিরতি");
                  return (
                    <tr
                      key={idx}
                      className={
                        isBreak
                          ? "bg-amber-50/80 font-bold text-amber-900 text-center"
                          : "hover:bg-gray-50 transition"
                      }
                    >
                      <td className="py-3 px-3 border border-gray-200 font-bold text-[#051939] text-center">
                        {slot.period}
                      </td>
                      <td className="py-3 px-3 border border-gray-200 font-mono text-xs text-center text-gray-600">
                        {slot.time}
                      </td>

                      {isBreak ? (
                        <td
                          colSpan={5}
                          className="py-3 px-3 border border-gray-200 text-center font-bold text-amber-800 tracking-wider"
                        >
                          {t("নামাজ ও দুপুরের টিফিন বিরতি", "Prayer & Lunch Break")}
                        </td>
                      ) : (
                        <>
                          <td className="py-3 px-3 border border-gray-200 font-bold text-[#06874A] text-center">
                            {slot.sunday}
                          </td>
                          <td className="py-3 px-3 border border-gray-200 font-bold text-[#06874A] text-center">
                            {slot.monday}
                          </td>
                          <td className="py-3 px-3 border border-gray-200 font-bold text-[#06874A] text-center">
                            {slot.tuesday}
                          </td>
                          <td className="py-3 px-3 border border-gray-200 font-bold text-[#06874A] text-center">
                            {slot.wednesday}
                          </td>
                          <td className="py-3 px-3 border border-gray-200 font-bold text-[#06874A] text-center">
                            {slot.thursday}
                          </td>
                        </>
                      )}

                      <td className="py-3 px-3 border border-gray-200 font-mono text-center text-gray-500">
                        {slot.room || "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Routine Note */}
          <div className="p-4 bg-gray-50 border-t border-gray-200 text-xs text-gray-600 flex flex-col sm:flex-row justify-between items-center gap-2">
            <span>
              {t(
                "* বিশেষ পরিস্থিতিতে বা পরীক্ষার পূর্বে প্রধান শিক্ষকের নির্দেশক্রমে রুটিন পরিবর্তিত হতে পারে।",
                "* Routine schedule is subject to administrative adjustments during exam periods."
              )}
            </span>
            <span className="font-bold text-[#051939]">
              {t("বানিয়াচং আদর্শ উচ্চ বিদ্যালয়", "BAHS Academic Council")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
