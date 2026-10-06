"use client";
import { useState, useEffect, useMemo } from "react";
import {
  FaUserCircle,
  FaSearch,
  FaTimes,
  FaUserTie,
  FaGraduationCap,
  FaAward,
} from "react-icons/fa";
import { useLanguage } from "@/lib/LanguageContext";

interface FormerStaff {
  id: string;
  name: string;
  nameEn: string;
  designation: string;
  designationEn: string;
  tenure: string;
  photo: string;
}

export default function FormerStaffPage() {
  const [headmasters, setHeadmasters] = useState<FormerStaff[]>([]);
  const [teachers, setTeachers] = useState<FormerStaff[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterMode, setFilterMode] = useState<"all" | "headmaster" | "teacher">("all");
  const [query, setQuery] = useState("");
  const { t, language } = useLanguage();

  useEffect(() => {
    fetch("/api/former-staff")
      .then((res) => res.json())
      .then((data) => {
        setHeadmasters(data.headmasters || []);
        setTeachers(data.teachers || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filterList = (list: FormerStaff[]) => {
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (item) =>
        item.name?.toLowerCase().includes(q) ||
        item.nameEn?.toLowerCase().includes(q) ||
        item.designation?.toLowerCase().includes(q) ||
        item.designationEn?.toLowerCase().includes(q) ||
        item.tenure?.toLowerCase().includes(q)
    );
  };

  const filteredHeadmasters = useMemo(() => filterList(headmasters), [query, headmasters]);
  const filteredTeachers = useMemo(() => filterList(teachers), [query, teachers]);

  const totalFiltered =
    (filterMode === "teacher" ? 0 : filteredHeadmasters.length) +
    (filterMode === "headmaster" ? 0 : filteredTeachers.length);

  const hasAnyResults =
    (filterMode === "all" && (filteredHeadmasters.length > 0 || filteredTeachers.length > 0)) ||
    (filterMode === "headmaster" && filteredHeadmasters.length > 0) ||
    (filterMode === "teacher" && filteredTeachers.length > 0);

  const renderCard = (teacher: FormerStaff) => {
    const hasRealPhoto = teacher.photo && !teacher.photo.includes("default_avatar");

    return (
      <div
        key={teacher.id}
        className="group relative bg-white rounded-2xl p-3 sm:p-3.5 border-2 border-slate-200/90 hover:border-[#051939] shadow-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 flex flex-col justify-between overflow-hidden text-center cursor-default"
      >
        {/* Top Accent Navy Blue Border */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#051939] via-blue-600 to-[#051939]" />

        {/* Photo Frame with Dual-Layer Regal Navy Border */}
        <div className="relative p-1.5 rounded-xl bg-gradient-to-b from-[#051939]/15 via-blue-50/40 to-slate-100 border-2 border-[#051939]/20 group-hover:border-[#051939]/80 shadow-sm transition-colors duration-300">
          <div className="relative w-full aspect-[4/5] rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shadow-inner flex items-center justify-center">
            {hasRealPhoto ? (
              <img
                src={teacher.photo}
                alt={language === "en" && teacher.nameEn ? teacher.nameEn : teacher.name}
                className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500 ease-out"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = "none";
                  const fallback = e.currentTarget.parentElement?.querySelector(".fallback-avatar") as HTMLElement;
                  if (fallback) fallback.style.display = "flex";
                }}
              />
            ) : null}

            <div
              className={`fallback-avatar ${
                hasRealPhoto ? "hidden" : "flex"
              } absolute inset-0 items-center justify-center text-slate-300 bg-slate-50 group-hover:text-slate-400 transition-colors`}
            >
              <FaUserCircle size={80} className="opacity-50" />
            </div>

            {/* Subtle Inner Glass Vignette on Hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#051939]/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          </div>
        </div>

        {/* Teacher Info */}
        <div className="pt-3.5 pb-1 px-1 flex-1 flex flex-col justify-between">
          <div>
            <h3 className="text-sm md:text-base font-extrabold text-[#051939] group-hover:text-blue-700 transition-colors leading-tight line-clamp-1">
              {language === "en" && teacher.nameEn ? teacher.nameEn : teacher.name}
            </h3>
            <div className="mt-1.5">
              <span className="inline-block text-[11px] md:text-xs font-semibold text-[#051939] bg-blue-50/90 border border-blue-200/80 px-2.5 py-0.5 rounded-full line-clamp-1 shadow-xs">
                {language === "en" && teacher.designationEn ? teacher.designationEn : teacher.designation}
              </span>
            </div>
            {teacher.tenure && (
              <p className="text-[11px] font-mono font-bold text-gray-600 mt-2 bg-gray-50 border border-gray-200 rounded-lg inline-block px-2.5 py-1">
                {t("কর্মকাল:", "Tenure:")} {teacher.tenure}
              </p>
            )}
          </div>

          {/* Animated Bottom Indicator */}
          <div className="w-8 group-hover:w-16 h-0.5 bg-gradient-to-r from-[#051939] to-blue-600 mx-auto mt-3 rounded-full transition-all duration-300" />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Page Header */}
      <div className="bg-[#465b6a] pt-12 pb-20 shadow-inner">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            {t("প্রাক্তন শিক্ষকবৃন্দ", "Former Teachers & Faculty")}
          </h1>
          <div className="w-16 h-1 bg-[#06874A] mx-auto mt-4 mb-2 rounded-full"></div>
          <p className="text-gray-200 text-sm md:text-base">
            {language === "en"
              ? `Baniyachong Adarsha High School — Honoring Our Former Educators (${headmasters.length + teachers.length} Members)`
              : `বানিয়াচং আদর্শ উচ্চ বিদ্যালয় — আমাদের শ্রদ্ধেয় প্রাক্তন শিক্ষকবৃন্দ (মোট ${headmasters.length + teachers.length} জন)`}
          </p>

          {/* Filter Pills */}
          <div className="mt-6 flex flex-wrap justify-center gap-2.5 sm:gap-3">
            <button
              onClick={() => {
                setFilterMode("all");
                setQuery("");
              }}
              className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all shadow-sm ${
                filterMode === "all"
                  ? "bg-white text-[#051939] shadow-lg scale-105"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              {t("সকল প্রাক্তন শিক্ষক", "All Former Teachers")} ({headmasters.length + teachers.length})
            </button>
            <button
              onClick={() => {
                setFilterMode("headmaster");
                setQuery("");
              }}
              className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all shadow-sm ${
                filterMode === "headmaster"
                  ? "bg-white text-[#051939] shadow-lg scale-105"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              🎓 {t("প্রাক্তন প্রধান শিক্ষক", "Former Headmasters")} ({headmasters.length})
            </button>
            <button
              onClick={() => {
                setFilterMode("teacher");
                setQuery("");
              }}
              className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all shadow-sm ${
                filterMode === "teacher"
                  ? "bg-white text-[#051939] shadow-lg scale-105"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              📚 {t("প্রাক্তন সহকারী শিক্ষক", "Former Assistant Teachers")} ({teachers.length})
            </button>
          </div>
        </div>
      </div>

      {/* Search Box */}
      <div className="container mx-auto px-4 -mt-6 mb-8">
        <div className="max-w-xl mx-auto relative">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("নাম বা পদবি দিয়ে খুঁজুন...", "Search by name or designation...")}
            className="w-full pl-11 pr-10 py-3 rounded-2xl border border-gray-200 shadow-md bg-white text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#06874A] focus:border-transparent placeholder:text-gray-400 transition"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
              aria-label="Clear search"
            >
              <FaTimes size={15} />
            </button>
          )}
        </div>
        {query && (
          <p className="text-center text-sm text-gray-500 mt-2">
            {totalFiltered === 0
              ? t(`"${query}" এর জন্য কোনো শিক্ষক পাওয়া যায়নি`, `No faculty member found for "${query}"`)
              : t(`${totalFiltered} জন শিক্ষক পাওয়া গেছে`, `Found ${totalFiltered} faculty members`)}
          </p>
        )}
      </div>

      {/* Content Area with Separate Divisions */}
      <div className="container mx-auto px-4 pb-20">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-[#06874A] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : !hasAnyResults ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl shadow-sm border border-gray-100 p-8 max-w-lg mx-auto">
            <FaUserCircle size={60} className="text-gray-300 mb-4" />
            <p className="text-gray-600 text-lg font-bold">
              {t("কোনো শিক্ষক পাওয়া যায়নি", "No faculty member found")}
            </p>
            {query && (
              <button
                onClick={() => setQuery("")}
                className="mt-4 text-[#06874A] text-sm hover:underline font-bold"
              >
                {t("সার্চ মুছুন ও সকল শিক্ষক দেখুন", "Clear search and view all")}
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-16">
            {/* ════════════════════════════════════════════════════════════════
                DIVISION 1: প্রাক্তন প্রধান শিক্ষকবৃন্দ (Former Headmasters)
               ════════════════════════════════════════════════════════════════ */}
            {(filterMode === "all" || filterMode === "headmaster") && filteredHeadmasters.length > 0 && (
              <section className="bg-white rounded-3xl p-5 sm:p-8 shadow-sm border border-slate-200/80">
                {/* Division Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-gray-100 gap-3">
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-[#051939] text-white flex items-center justify-center shadow-md shrink-0">
                      <FaAward size={22} className="text-yellow-400" />
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-extrabold text-[#051939] flex items-center gap-2">
                        <span>{t("প্রাক্তন প্রধান শিক্ষকবৃন্দ", "Former Headmasters")}</span>
                        <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full">
                          {filteredHeadmasters.length} {t("জন", "")}
                        </span>
                      </h2>
                      <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                        {t(
                          "বানিয়াচং আদর্শ উচ্চ বিদ্যালয়ের সাবেক সুযোগ্য প্রধান শিক্ষকগণের তালিকা",
                          "List of respected former headmasters of the school"
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                  {filteredHeadmasters.map((item) => renderCard(item))}
                </div>
              </section>
            )}

            {/* ════════════════════════════════════════════════════════════════
                DIVISION 2: প্রাক্তন সহকারী শিক্ষকবৃন্দ (Former Assistant Teachers)
               ════════════════════════════════════════════════════════════════ */}
            {(filterMode === "all" || filterMode === "teacher") && filteredTeachers.length > 0 && (
              <section className="bg-white rounded-3xl p-5 sm:p-8 shadow-sm border border-slate-200/80">
                {/* Division Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-gray-100 gap-3">
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-[#06874A] text-white flex items-center justify-center shadow-md shrink-0">
                      <FaGraduationCap size={22} className="text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-extrabold text-[#051939] flex items-center gap-2">
                        <span>{t("প্রাক্তন সহকারী শিক্ষক ও শিক্ষকবৃন্দ", "Former Assistant Teachers & Faculty")}</span>
                        <span className="text-xs bg-blue-100 text-blue-800 font-bold px-2.5 py-0.5 rounded-full">
                          {filteredTeachers.length} {t("জন", "")}
                        </span>
                      </h2>
                      <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                        {t(
                          "বানিয়াচং আদর্শ উচ্চ বিদ্যালয়ের সাবেক সহকারী শিক্ষক ও শিক্ষকবৃন্দের তালিকা",
                          "List of dedicated former assistant teachers and faculty members"
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                  {filteredTeachers.map((item) => renderCard(item))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
