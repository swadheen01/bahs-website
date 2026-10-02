"use client";
import { useState, useEffect } from "react";
import HeroSlider from "@/components/home/HeroSlider";
import MarqueeNotice from "@/components/home/MarqueeNotice";
import QuickLinks from "@/components/home/QuickLinks";
import NoticeBoard from "@/components/home/NoticeBoard";
import StatsSection from "@/components/home/StatsSection";
import TeachersSection from "@/components/home/TeachersSection";
import AlumniSection from "@/components/home/AlumniSection";
import schoolInfo from "@/data/school-info.json";
import Link from "next/link";
import { FaExternalLinkAlt, FaGraduationCap, FaBookOpen, FaAward, FaStar, FaFacebook } from "react-icons/fa";
import { useLanguage } from "@/lib/LanguageContext";

const classStyles: Record<number, { gradient: string; shadow: string; accent: string }> = {
  6: {
    gradient: "from-emerald-500 via-teal-600 to-cyan-700",
    shadow: "hover:shadow-emerald-500/30",
    accent: "bg-emerald-400/20 text-emerald-100",
  },
  7: {
    gradient: "from-blue-600 via-indigo-600 to-violet-700",
    shadow: "hover:shadow-blue-500/30",
    accent: "bg-blue-400/20 text-blue-100",
  },
  8: {
    gradient: "from-purple-600 via-fuchsia-600 to-pink-700",
    shadow: "hover:shadow-purple-500/30",
    accent: "bg-purple-400/20 text-purple-100",
  },
  9: {
    gradient: "from-amber-500 via-orange-600 to-red-600",
    shadow: "hover:shadow-orange-500/30",
    accent: "bg-amber-400/20 text-amber-100",
  },
  10: {
    gradient: "from-rose-600 via-red-600 to-rose-800",
    shadow: "hover:shadow-rose-500/30",
    accent: "bg-rose-400/20 text-rose-100",
  },
};

export default function HomePage() {
  const { t, language } = useLanguage();
  const [classes, setClasses] = useState<any[]>(schoolInfo.classes || []);

  useEffect(() => {
    fetch("/api/school-info")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.classes && Array.isArray(data.classes)) {
          setClasses(data.classes);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className={language === "bn" ? "font-bengali" : "font-sans"}>
      {/* Hero Slider */}
      <HeroSlider />

      {/* Scrolling Notice Bar */}
      <MarqueeNotice />

      {/* Quick Links */}
      <QuickLinks />

      {/* Stats */}
      <StatsSection />

      {/* President & Headmaster Messages + Notice Board */}
      <section className="py-12 bg-gradient-to-b from-gray-50 to-gray-100/60">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Left Column (2 Cols): History & Messages */}
            <div className="lg:col-span-2 space-y-6">
              {/* History Card with Glossy Hover */}
              <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 glossy-shine transition-all duration-300 hover:shadow-xl">
                <div className="bg-gradient-to-r from-[#051939] via-[#0b2959] to-[#051939] text-white px-6 py-3.5 flex items-center justify-between">
                  <h2 className="font-bold text-lg flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#06874A] animate-ping" />
                    {t("প্রতিষ্ঠানের ইতিহাস", "History of the Institution")}
                  </h2>
                  <span className="text-xs text-yellow-300 font-bold bg-white/10 px-3 py-1 rounded-full border border-white/10">
                    {t("স্থাপিত: ১৯৮৫", "Est: 1985")}
                  </span>
                </div>
                <div className="p-6 bg-white/80">
                  <p className="text-sm md:text-[15px] text-gray-700 leading-relaxed text-justify">
                    {language === "en" ? schoolInfo.history.english : schoolInfo.history.bengali}
                  </p>
                  <div className="mt-5 flex justify-end">
                    <Link
                      href="/about"
                      className="inline-flex items-center gap-2 bg-[#051939] hover:bg-[#06874A] text-white text-xs px-5 py-2.5 rounded-xl font-bold shadow-md hover:shadow-lg transition-all"
                    >
                      <span>{t("বিস্তারিত ইতিহাস পড়ুন →", "Read Full History →")}</span>
                    </Link>
                  </div>
                </div>
              </div>

              {/* President & Headmaster Messages */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Headmaster Message */}
                <div className="bg-white rounded-2xl shadow-md overflow-hidden border-t-4 border-[#06874A] border-x border-b border-gray-100 flex flex-col justify-between glossy-shine transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                  <div className="bg-gradient-to-r from-[#06874A] to-[#046336] text-white px-5 py-3">
                    <h2 className="font-bold text-base flex items-center gap-2">
                      <FaAward className="text-yellow-300" />
                      {t("প্রধান শিক্ষকের বাণী", "Headmaster's Message")}
                    </h2>
                  </div>
                  <div className="p-5 flex-1 flex flex-col bg-white">
                    <div className="flex justify-center mb-4">
                      <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-emerald-100 shadow-md bg-gray-100 group">
                        <img
                          src="/images/teachers/headmaster.jpg"
                          alt="Headmaster"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    <p className="text-xs md:text-sm text-gray-700 leading-relaxed line-clamp-5 flex-1 text-justify">
                      {language === "en" ? schoolInfo.headmasterMessage.messageEn : schoolInfo.headmasterMessage.message}
                    </p>
                    <div className="mt-5 pt-3 border-t border-gray-100 text-center">
                      <p className="text-sm font-bold text-[#06874A]">
                        — {language === "en" ? schoolInfo.headmasterMessage.nameEn : schoolInfo.headmasterMessage.name}
                      </p>
                      <p className="text-xs text-gray-500 font-medium">
                        {language === "en" ? schoolInfo.headmasterMessage.designationEn : schoolInfo.headmasterMessage.designation}
                      </p>
                    </div>
                  </div>
                </div>

                {/* President Message */}
                <div className="bg-white rounded-2xl shadow-md overflow-hidden border-t-4 border-[#A53146] border-x border-b border-gray-100 flex flex-col justify-between glossy-shine transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                  <div className="bg-gradient-to-r from-[#A53146] to-[#791f30] text-white px-5 py-3">
                    <h2 className="font-bold text-base flex items-center gap-2">
                      <FaStar className="text-yellow-300" />
                      {t("সভাপতির বাণী", "President's Message")}
                    </h2>
                  </div>
                  <div className="p-5 flex-1 flex flex-col bg-white">
                    <div className="flex justify-center mb-4">
                      <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-rose-100 shadow-md bg-gray-100">
                        <img
                          src="/images/president/president.jpg"
                          alt="President"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    <p className="text-xs md:text-sm text-gray-700 leading-relaxed line-clamp-5 flex-1 text-justify">
                      {language === "en" ? schoolInfo.presidentMessage.messageEn : schoolInfo.presidentMessage.message}
                    </p>
                    <div className="mt-5 pt-3 border-t border-gray-100 text-center">
                      <p className="text-sm font-bold text-[#A53146]">
                        — {language === "en" ? schoolInfo.presidentMessage.nameEn : schoolInfo.presidentMessage.name}
                      </p>
                      <p className="text-xs text-gray-500 font-medium">
                        {t("সভাপতি, পরিচালনা পর্ষদ", "President, Governing Body")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column (1 Col): Notice Board, Facebook & Official Links (Pulled right up snugly!) */}
            <div className="space-y-6">
              {/* Notice Board */}
              <NoticeBoard />

              {/* Follow Us on Facebook (ফেসবুকে আমরা) */}
              <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-blue-100 glossy-shine transition-all duration-300 hover:shadow-xl group">
                <div className="bg-gradient-to-r from-[#1877F2] to-[#0D65D9] text-white px-5 py-3.5 flex items-center justify-between">
                  <h2 className="font-bold text-base flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white">
                      <FaFacebook size={16} />
                    </span>
                    {t("ফেসবুকে আমরা", "Follow Us on Facebook")}
                  </h2>
                  <span className="text-[10px] bg-white/15 px-2.5 py-0.5 rounded-full border border-white/20 font-medium">
                    {t("অফিসিয়াল পেজ", "Official Page")}
                  </span>
                </div>
                <div className="p-4 bg-gradient-to-b from-blue-50/50 to-white">
                  <div className="flex items-center gap-3 mb-3.5">
                    <div className="w-11 h-11 rounded-xl bg-[#1877F2] text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
                      <FaFacebook size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-xs md:text-sm text-[#051939] leading-tight">
                        {language === "en" ? "Baniyachong Adarsha High School" : "বানিয়াচং আদর্শ উচ্চ বিদ্যালয়"}
                      </h3>
                      <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">
                        {t("সাম্প্রতিক তথ্য, নোটিশ ও ছবি পেতে আমাদের পেজে যুক্ত থাকুন", "Stay connected for latest updates, notices & memories")}
                      </p>
                    </div>
                  </div>
                  <a
                    href="https://www.facebook.com/profile.php?id=100048911620274"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#1877F2] to-[#0D65D9] hover:from-[#166fe5] hover:to-[#0b5ac5] text-white text-xs font-bold transition-all duration-300 shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 group-hover:scale-[1.01]"
                  >
                    <FaFacebook size={14} />
                    <span>{t("ফেসবুক পেজ ভিজিট করুন", "Visit Facebook Page")}</span>
                    <FaExternalLinkAlt size={10} className="ml-1 opacity-80" />
                  </a>
                </div>
              </div>

              {/* Official Links (Now directly beneath Notice Board with NO empty space) */}
              <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 glossy-shine transition-all duration-300 hover:shadow-xl">
                <div className="bg-gradient-to-r from-[#965D03] to-[#714400] text-white px-5 py-3 flex items-center justify-between">
                  <h2 className="font-bold text-base flex items-center gap-2">
                    <FaExternalLinkAlt size={14} className="text-yellow-300" />
                    {t("অফিসিয়াল লিংক", "Official Links")}
                  </h2>
                  <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full border border-white/20">
                    {schoolInfo.officialLinks.length} {t("টি পোর্টাল", "Portals")}
                  </span>
                </div>
                <ul className="divide-y divide-gray-100">
                  {schoolInfo.officialLinks.map((link) => (
                    <li key={link.url}>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between px-4 py-2.5 text-xs text-[#051939] hover:bg-gradient-to-r hover:from-amber-500 hover:to-orange-500 hover:text-white transition-all duration-200 group"
                      >
                        <span className="font-medium group-hover:translate-x-1 transition-transform">
                          {language === "en" ? link.nameEn : link.name}
                        </span>
                        <FaExternalLinkAlt className="text-[10px] text-gray-400 group-hover:text-white shrink-0 ml-2" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Teachers Section */}
      <TeachersSection />

      {/* Colorful, Dedicated Students' Corner Section (Moved cleanly down with distinct vibrant glass styling!) */}
      <section className="py-16 bg-gradient-to-r from-[#051939] via-[#09224d] to-[#051939] text-white relative overflow-hidden">
        {/* Background decorative glass orbs */}
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-pink-500/10 blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/10 text-emerald-300 border border-white/15 mb-3">
              <FaGraduationCap size={14} />
              {t("শ্রেণিভিত্তিক কর্নার", "Academic Classes")}
            </span>
            <h2 className="text-2xl md:text-4xl font-extrabold text-white">
              {t("শিক্ষার্থীদের কর্নার", "Students' Corner")}
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-emerald-400 to-teal-400 mx-auto mt-3 mb-3 rounded-full" />
            <p className="text-gray-300 text-xs md:text-sm max-w-xl mx-auto">
              {t(
                "প্রতিটি শ্রেণির রুটিন, সিলেবাস ও একাডেমিক তথ্যের জন্য সংশ্লিষ্ট শ্রেণিতে ক্লিক করুন",
                "Click on your respective grade to explore weekly routines, syllabi and class schedules"
              )}
            </p>
          </div>

          {/* 5 Colorful Class Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5 max-w-5xl mx-auto">
            {classes.map((cls) => {
              const style = classStyles[cls.num] || {
                gradient: "from-blue-600 via-indigo-600 to-violet-700",
                shadow: "hover:shadow-blue-500/30",
                accent: "bg-blue-400/20 text-blue-100",
              };
              return (
                <Link
                  key={cls.num}
                  href={`/students/class-${cls.num}`}
                  className={`group relative bg-gradient-to-br ${style.gradient} p-5 rounded-2xl shadow-lg ${style.shadow} hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-white/20 glossy-shine flex flex-col items-center justify-between text-center overflow-hidden`}
                >
                  {/* Floating subtle circle */}
                  <div className="absolute -top-6 -right-6 w-16 h-16 rounded-full bg-white/15 blur-sm" />

                  <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white mb-3 shadow-inner group-hover:scale-110 transition-transform">
                    <FaBookOpen size={20} />
                  </div>

                  <div>
                    <h3 className="text-lg md:text-xl font-black text-white tracking-tight">
                      {language === "en" ? (cls.nameEn || cls.nameBn || cls.name) : (cls.nameBn || cls.name || cls.nameEn)}
                    </h3>
                    <span className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full mt-2 ${style.accent}`}>
                      {t("শিক্ষার্থী", "Students")}: {language === "en" ? (cls.studentsEn || cls.students) : cls.students}
                    </span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/20 w-full flex items-center justify-center gap-1 text-[11px] font-bold text-white/90 group-hover:text-white">
                    <span>{t("বিস্তারিত দেখুন", "View Details")}</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Alumni Section */}
      <AlumniSection />
    </div>
  );
}
