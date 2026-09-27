"use client";
import Link from "next/link";
import formerHeads from "@/data/former-headmasters.json";
import { FaUserTie, FaAward, FaCalendarAlt, FaLandmark } from "react-icons/fa";
import { useLanguage } from "@/lib/LanguageContext";

export default function FormerHeadmastersPage() {
  const { t, language } = useLanguage();

  return (
    <div className={`min-h-screen bg-gray-50 pb-20 ${language === "bn" ? "font-bengali" : "font-sans"}`}>
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-[#051939] via-[#092b5e] to-[#051939] text-white py-12 shadow-md">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
            <FaLandmark size={16} />
            <span>{t("ঐতিহ্য ও নেতৃত্ব", "Heritage & Leadership")}</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">
            {t("প্রাক্তন প্রধান শিক্ষকবৃন্দ", "Former Headmasters of BAHS")}
          </h1>
          <p className="text-gray-300 text-xs sm:text-sm mt-2 flex items-center gap-2">
            <Link href="/" className="hover:text-yellow-300 transition-colors">
              {t("প্রচ্ছদ", "Home")}
            </Link>
            <span>&rsaquo;</span>
            <span>{t("প্রশাসন", "Administration")}</span>
            <span>&rsaquo;</span>
            <span className="text-yellow-300 font-bold">{t("প্রাক্তন প্রধান শিক্ষক", "Former Headmasters")}</span>
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-6 max-w-6xl space-y-8 relative z-10">
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100">
          <div className="border-b border-gray-100 pb-4 mb-6">
            <h2 className="text-xl font-bold text-[#051939]">
              {t("প্রতিষ্ঠালগ্ন থেকে অদ্যবধি দায়িত্ব পালনকারী প্রধান শিক্ষকগণ", "Headmasters Serving BAHS Since 1985")}
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              {t(
                "বিদ্যালয়ের শিক্ষা বিস্তার ও আদর্শ মানুষ গড়ার মহান দায়িত্বে যাঁদের অবদান চিরস্মরণীয়।",
                "Honoring the visionary educational leaders who shaped the history and glory of BAHS."
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {formerHeads.map((head, idx) => (
              <div
                key={head.id}
                className="p-5 rounded-2xl bg-gray-50 border border-gray-200 hover:border-[#06874A] hover:bg-emerald-50/20 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-20 rounded-2xl overflow-hidden bg-gray-200 border-2 border-emerald-500/40 shadow-sm shrink-0">
                    <img
                      src={head.photo || "/images/teachers/default_avatar.png"}
                      alt={head.name}
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full inline-block mb-1">
                      {idx === formerHeads.length - 1 ? t("বর্তমান প্রধান শিক্ষক", "Current Headmaster") : t("প্রাক্তন প্রধান শিক্ষক", "Former Headmaster")}
                    </span>
                    <h3 className="font-extrabold text-base text-[#051939]">
                      {language === "en" ? head.nameEn || head.name : head.name}
                    </h3>
                    <p className="text-xs font-mono font-bold text-gray-600 flex items-center gap-1.5 mt-0.5">
                      <FaCalendarAlt className="text-emerald-600 text-[10px]" /> {head.tenure}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-gray-600 leading-relaxed text-justify">
                  {head.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
