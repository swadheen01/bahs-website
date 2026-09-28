"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import initialHolidays from "@/data/holidays.json";
import {
  FaCalendarAlt,
  FaDownload,
  FaPrint,
  FaFilePdf,
  FaCheckCircle,
  FaSun,
  FaMosque,
  FaFlag,
  FaSearch,
} from "react-icons/fa";
import { useLanguage } from "@/lib/LanguageContext";
import { safeDownloadFile } from "@/lib/downloadFile";

export default function HolidaysPage() {
  const { t, language } = useLanguage();
  const [data, setData] = useState<any>(initialHolidays);
  const [filterType, setFilterType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetch("/api/holidays")
      .then((res) => res.json())
      .then((resData) => {
        if (resData && resData.holidays) {
          setData(resData);
        }
      })
      .catch(() => {});
  }, []);

  const holidays = data?.holidays || initialHolidays.holidays || [];

  const filteredHolidays = holidays.filter((h: any) => {
    if (filterType !== "all" && !h.type?.includes(filterType)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = h.title?.toLowerCase().includes(q);
      const matchTitleEn = h.titleEn?.toLowerCase().includes(q);
      if (!matchTitle && !matchTitleEn) return false;
    }
    return true;
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={`min-h-screen bg-gray-50 pb-20 ${language === "bn" ? "font-bengali" : "font-sans"}`}>
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-[#051939] via-[#092b5e] to-[#051939] text-white py-12 shadow-md">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
            <FaCalendarAlt size={16} />
            <span>{t("একাডেমিক ক্যালেন্ডার", "Academic Calendar")}</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">
            {t(`বার্ষিক ছুটির তালিকা ও শিক্ষাপঞ্জি ${data.academicYear || "২০২৬"}`, `Annual Holiday List & Academic Calendar ${data.academicYear || "2026"}`)}
          </h1>
          <p className="text-gray-300 text-xs sm:text-sm mt-2 flex items-center gap-2">
            <Link href="/" className="hover:text-yellow-300 transition-colors">
              {t("প্রচ্ছদ", "Home")}
            </Link>
            <span>&rsaquo;</span>
            <span>{t("একাডেমিক", "Academics")}</span>
            <span>&rsaquo;</span>
            <span className="text-yellow-300 font-bold">{t("ছুটির তালিকা", "Holidays")}</span>
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-6 max-w-6xl space-y-8 relative z-10">
        {/* Top 3 Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl shadow-md border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl shrink-0">
              <FaCheckCircle />
            </div>
            <div>
              <span className="text-xs text-gray-500 font-bold block">{t("মোট নির্ধারিত ছুটি", "Total Listed Holidays")}</span>
              <strong className="text-2xl font-black text-[#051939] font-mono">{holidays.length} {t("টি", "")}</strong>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-md border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl shrink-0">
              <FaSun />
            </div>
            <div>
              <span className="text-xs text-gray-500 font-bold block">{t("দীর্ঘ অবকাশ", "Long Vacations")}</span>
              <strong className="text-sm font-extrabold text-amber-900">{t("রমজান, ঈদ ও শীতকালীন", "Ramadan, Eid & Winter")}</strong>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-md border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl shrink-0">
              <FaCalendarAlt />
            </div>
            <div>
              <span className="text-xs text-gray-500 font-bold block">{t("চলতি শিক্ষাবর্ষ", "Academic Session")}</span>
              <strong className="text-2xl font-black text-[#051939] font-mono">{data.academicYear || "2025"}</strong>
            </div>
          </div>
        </div>

        {/* PDF Download Card (Uploaded by Admin) */}
        {data.calendarPdfUrl && (
          <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center text-2xl shrink-0">
                <FaFilePdf />
              </span>
              <div>
                <h3 className="font-bold text-base text-[#051939]">
                  {data.calendarPdfTitle || t("অফিসিয়াল ছুটির তালিকা ও শিক্ষাপঞ্জি PDF", "Official Holiday Calendar PDF")}
                </h3>
                <p className="text-xs text-gray-500">
                  {t("শিক্ষা মন্ত্রণালয় ও বিদ্যালয় কর্তৃপক্ষ কর্তৃক অনুমোদিত", "Approved by School Authority")}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => safeDownloadFile(data.calendarPdfUrl, data.calendarPdfTitle || "Academic_Calendar")}
              className="inline-flex items-center gap-2 bg-[#06874A] hover:bg-green-700 text-white font-bold py-2.5 px-5 rounded-xl text-xs shadow-md transition cursor-pointer shrink-0"
            >
              <FaDownload />
              <span>{t("ক্যালেন্ডার PDF ডাউনলোড করুন", "Download PDF Calendar")}</span>
            </button>
          </div>
        )}

        {/* Holiday Table Container */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden printable-holidays">
          <div className="bg-gradient-to-r from-[#051939] via-[#092b5e] to-[#051939] text-white p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-1">
                {t("বিদ্যালয়ের বার্ষিক ছুটির তালিকা", "School Holiday Calendar")}
              </span>
              <h2 className="text-xl sm:text-2xl font-black">
                {t(`শিক্ষাবর্ষ ${data.academicYear || "২০২৬"} ছুটির পূর্ণাঙ্গ তালিকা`, `Full Holiday Schedule ${data.academicYear || "2026"}`)}
              </h2>
            </div>

            <div className="no-print flex items-center gap-3">
              <button
                onClick={handlePrint}
                className="bg-white/20 hover:bg-white/30 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 border border-white/30 transition cursor-pointer"
              >
                <FaPrint />
                <span>{t("প্রিন্ট করুন", "Print")}</span>
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="no-print p-4 bg-gray-50 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: "all", labelBn: "সকল ছুটি", labelEn: "All Holidays" },
                { id: "জাতীয়", labelBn: "জাতীয় দিবস", labelEn: "National Days" },
                { id: "ধর্মীয়", labelBn: "ধর্মীয় উৎসব", labelEn: "Religious" },
                { id: "অবকাশ", labelBn: "দীর্ঘ অবকাশ", labelEn: "Vacations" },
              ].map((btn) => (
                <button
                  key={btn.id}
                  onClick={() => setFilterType(btn.id)}
                  className={`py-1.5 px-3.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    filterType === btn.id
                      ? "bg-[#06874A] text-white shadow"
                      : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  {language === "en" ? btn.labelEn : btn.labelBn}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-60">
              <FaSearch className="absolute left-3 top-2.5 text-gray-400 text-xs" />
              <input
                type="text"
                placeholder={t("ছুটি অনুসন্ধান করুন...", "Search holiday...")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border rounded-xl pl-8 pr-3 py-1.5 text-xs bg-white focus:bg-gray-50"
              />
            </div>
          </div>

          {/* Holidays Table */}
          <div className="p-4 sm:p-6 overflow-x-auto">
            <table className="w-full text-xs sm:text-sm text-left border-collapse">
              <thead>
                <tr className="bg-[#051939] text-white uppercase text-xs">
                  <th className="py-3 px-4">{t("ক্রমিক", "SL")}</th>
                  <th className="py-3 px-4">{t("ছুটির বিবরণ / উপলক্ষ", "Occasion / Event")}</th>
                  <th className="py-3 px-4">{t("তারিখ (শুরু - সমাপ্তি)", "Date Range")}</th>
                  <th className="py-3 px-4 text-center">{t("মোট দিন", "Days")}</th>
                  <th className="py-3 px-4 text-center">{t("ছুটির ধরন", "Type")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredHolidays.map((holiday: any, idx: number) => (
                  <tr key={holiday.id} className="hover:bg-gray-50 transition">
                    <td className="py-3 px-4 font-mono text-gray-400">{idx + 1}</td>
                    <td className="py-3 px-4">
                      <strong className="text-sm text-[#051939] block">
                        {language === "en" ? holiday.titleEn || holiday.title : holiday.title}
                      </strong>
                      {holiday.description && (
                        <span className="text-xs text-gray-500 block mt-0.5">{holiday.description}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-gray-700">
                      {holiday.startDate}
                      {holiday.endDate && holiday.endDate !== holiday.startDate && (
                        <span> থেকে {holiday.endDate}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-emerald-700">
                      {holiday.totalDays}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800">
                        {holiday.type}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-gray-50 border-t border-gray-200 text-xs text-gray-600 flex justify-between items-center">
            <span>{t("* চাঁদ দেখার ওপর ধর্মীয় ছুটির তারিখ পরিবর্তন হতে পারে।", "* Religious holidays are subject to moon sighting.")}</span>
            <span className="font-bold text-[#051939]">{t("বানিয়াচং আদর্শ উচ্চ বিদ্যালয়", "BAHS Management")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
