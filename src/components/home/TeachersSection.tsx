"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { FaUsers, FaArrowRight } from "react-icons/fa";
import { useLanguage } from "@/lib/LanguageContext";
import initialTeachers from "@/data/teachers.json";

interface Teacher {
  id: number;
  nameBengali: string;
  nameEnglish?: string;
  designation: string;
  designationEn?: string;
  subject?: string;
  category: string;
  photo?: string;
}

export default function TeachersSection() {
  const [teachers, setTeachers] = useState<Teacher[]>(() => {
    return (initialTeachers.slice(0, 6) as Teacher[]) || [];
  });
  const { t, language } = useLanguage();

  useEffect(() => {
    fetch("/api/teachers")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setTeachers(data.slice(0, 6));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section className="py-14 bg-gradient-to-b from-gray-50 via-white to-gray-50 border-t border-gray-100">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200/80 mb-3 shadow-xs">
            <FaUsers size={14} className="text-emerald-600" />
            <span>{t("শিক্ষক পরিষদ", "Faculty Council")}</span>
          </div>
          <h2 className="text-2xl md:text-4xl font-extrabold text-[#051939] tracking-tight">
            {t("আমাদের শিক্ষকমণ্ডলী", "Our Respected Faculty")}
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-[#06874A] via-emerald-400 to-[#051939] mx-auto mt-3 mb-3 rounded-full" />
          <p className="text-gray-600 text-xs md:text-sm max-w-xl mx-auto">
            {t(
              "অভিজ্ঞ ও দক্ষ শিক্ষক-শিক্ষিকাদের তত্ত্বাবধানে আমাদের শিক্ষার্থীরা সুশিক্ষিত হচ্ছে",
              "Our students thrive under the mentorship of our dedicated and accomplished educators"
            )}
          </p>
        </div>

        {/* Teachers Grid with Premium Navy Frames */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-5">
          {teachers.map((teacher) => (
            <Link
              key={teacher.id}
              href={`/administration/all-teachers/${teacher.id}`}
              className="group relative bg-white rounded-2xl p-2.5 sm:p-3 border-2 border-slate-200/90 hover:border-[#051939] shadow-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 flex flex-col justify-between overflow-hidden text-center"
            >
              {/* Top Accent Navy Blue Border */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#051939] via-blue-600 to-[#051939]" />

              {/* Photo Frame with Elegant Dual-Layer Navy Border */}
              <div className="relative p-1 rounded-xl bg-gradient-to-b from-[#051939]/15 via-blue-50/40 to-slate-100 border-2 border-[#051939]/20 group-hover:border-[#051939]/80 shadow-sm transition-colors duration-300">
                <div className="relative w-full aspect-[4/5] rounded-lg overflow-hidden bg-slate-100 border border-slate-200 shadow-inner">
                  {teacher.photo ? (
                    <Image
                      src={teacher.photo}
                      alt={teacher.nameBengali}
                      fill
                      className="object-cover object-top group-hover:scale-105 transition-transform duration-500 ease-out"
                      sizes="(max-width: 640px) 160px, 220px"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-300 bg-slate-50">
                      <FaUsers size={40} />
                    </div>
                  )}

                  {/* Subtle Inner Glass Vignette on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#051939]/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </div>
              </div>

              {/* Teacher Info */}
              <div className="pt-3 pb-1 px-1 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs sm:text-[13px] font-extrabold text-[#051939] group-hover:text-blue-700 transition-colors leading-tight line-clamp-1">
                    {language === "en" && teacher.nameEnglish ? teacher.nameEnglish : teacher.nameBengali}
                  </h3>
                  <div className="mt-1.5">
                    <span className="inline-block text-[10px] sm:text-[11px] font-semibold text-[#051939] bg-blue-50/90 border border-blue-200/80 px-2 py-0.5 rounded-full line-clamp-1 shadow-xs">
                      {language === "en" && teacher.designationEn ? teacher.designationEn : teacher.designation}
                    </span>
                  </div>
                </div>

                {/* Animated Bottom Indicator */}
                <div className="w-6 group-hover:w-12 h-0.5 bg-gradient-to-r from-[#051939] to-blue-600 mx-auto mt-2 rounded-full transition-all duration-300" />
              </div>
            </Link>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-10">
          <Link
            href="/administration/all-teachers"
            className="inline-flex items-center gap-2 bg-[#051939] hover:bg-[#06874A] text-white text-xs sm:text-sm px-7 py-3 rounded-full font-bold shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <span>{t("সকল শিক্ষকমণ্ডলী দেখুন", "View All Faculty Members")}</span>
            <FaArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}

