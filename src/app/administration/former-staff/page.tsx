"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { FaUserTie, FaCalendarAlt, FaLandmark, FaUserCircle } from "react-icons/fa";
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
  const { t, language } = useLanguage();
  const [headmasters, setHeadmasters] = useState<FormerStaff[]>([]);
  const [teachers, setTeachers] = useState<FormerStaff[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"headmaster" | "teacher">("headmaster");

  useEffect(() => {
    fetch("/api/former-staff")
      .then(res => res.json())
      .then(data => {
        setHeadmasters(data.headmasters || []);
        setTeachers(data.teachers || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const currentList = activeTab === "headmaster" ? headmasters : teachers;

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
            {t("প্রাক্তন শিক্ষকমণ্ডলী", "Former Faculty of BAHS")}
          </h1>
          <p className="text-gray-300 text-xs sm:text-sm mt-2 flex items-center gap-2">
            <Link href="/" className="hover:text-yellow-300 transition-colors">
              {t("প্রচ্ছদ", "Home")}
            </Link>
            <span>&rsaquo;</span>
            <span>{t("প্রশাসন", "Administration")}</span>
            <span>&rsaquo;</span>
            <span className="text-yellow-300 font-bold">{t("সাবেক শিক্ষকমণ্ডলী", "Former Faculty")}</span>
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-6 max-w-6xl space-y-8 relative z-10">
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100">
          
          <div className="flex flex-wrap gap-4 mb-8 border-b border-gray-100 pb-4">
            <button
              onClick={() => setActiveTab("headmaster")}
              className={`px-5 py-2.5 rounded-xl font-bold transition-all duration-300 ${activeTab === "headmaster" ? "bg-[#051939] text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              {t("প্রাক্তন প্রধান শিক্ষক", "Former Headmasters")}
            </button>
            <button
              onClick={() => setActiveTab("teacher")}
              className={`px-5 py-2.5 rounded-xl font-bold transition-all duration-300 ${activeTab === "teacher" ? "bg-[#051939] text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              {t("অন্যান্য প্রাক্তন শিক্ষক", "Other Former Teachers")}
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-4 border-[#06874A] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : currentList.length === 0 ? (
            <div className="text-center py-20">
              <FaUserCircle size={60} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 font-medium">{t("কোনো তথ্য পাওয়া যায়নি", "No records found")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {currentList.map((staff) => (
                <div
                  key={staff.id}
                  className="group relative bg-white rounded-2xl p-4 border-2 border-slate-200/90 hover:border-[#051939] shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col items-center text-center overflow-hidden"
                >
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#051939] via-blue-600 to-[#051939]" />
                  
                  <div className="relative w-32 h-40 mb-4 rounded-xl overflow-hidden border-2 border-[#051939]/10 p-1 group-hover:border-[#051939]/30 transition-colors">
                    <img
                      src={staff.photo || "/images/teachers/default_avatar.png"}
                      alt={staff.name}
                      className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  <h3 className="font-extrabold text-[#051939] text-lg mb-1 group-hover:text-blue-700 transition-colors">
                    {language === "en" ? staff.nameEn : staff.name}
                  </h3>
                  
                  <span className="inline-block text-[11px] font-bold text-[#051939] bg-blue-50/90 border border-blue-200/80 px-3 py-1 rounded-full mb-3">
                    {language === "en" ? staff.designationEn : staff.designation}
                  </span>

                  <div className="mt-auto pt-3 border-t border-gray-100 w-full">
                    <p className="text-xs font-mono font-bold text-emerald-700 flex items-center justify-center gap-1.5 bg-emerald-50 py-1.5 rounded-lg border border-emerald-100">
                      <FaCalendarAlt />
                      {t("কর্মকাল:", "Tenure:")} {staff.tenure}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
