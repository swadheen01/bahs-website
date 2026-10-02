"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { FaGraduationCap, FaAward } from "react-icons/fa";
import { useLanguage } from "@/lib/LanguageContext";
import initialAlumni from "@/data/alumni.json";
import schoolInfo from "@/data/school-info.json";

interface Alumni {
  id: number;
  nameBengali: string;
  nameEnglish?: string;
  institution: string;
  degree: string;
  photo?: string;
}

export default function AlumniSection() {
  const [alumni, setAlumni] = useState<Alumni[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = sessionStorage.getItem("bahs_cached_alumni");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (e) {}
    }
    return (initialAlumni as Alumni[]) || [];
  });

  const [showSection, setShowSection] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = sessionStorage.getItem("bahs_show_alumni");
        if (cached !== null) return cached === "true";
      } catch (e) {}
    }
    return schoolInfo.showAlumniSection ?? true;
  });

  const { t, language } = useLanguage();

  useEffect(() => {
    fetch("/api/school-info")
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.showAlumniSection !== "undefined") {
          setShowSection(data.showAlumniSection);
          try {
            sessionStorage.setItem("bahs_show_alumni", String(data.showAlumniSection));
          } catch (e) {}
        }
      })
      .catch(() => {});

    fetch("/api/alumni")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setAlumni(data);
          try {
            sessionStorage.setItem("bahs_cached_alumni", JSON.stringify(data));
          } catch (e) {}
        }
      })
      .catch(() => {});
  }, []);

  if (!showSection || !alumni || alumni.length === 0) return null;

  return (
    <section className="py-12 bg-white border-t border-gray-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-[#051939]">
            {t("আমাদের কৃতি শিক্ষার্থী", "Our Proud Alumni")}
          </h2>
          <div className="w-16 h-1 bg-[#06874A] mx-auto mt-2 mb-3 rounded" />
          <p className="text-gray-600 text-xs md:text-sm max-w-2xl mx-auto">
            {t(
              "যাঁরা নিজেদের মেধা ও যোগ্যতায় বিভিন্ন ক্ষেত্রে সাফল্যের স্বাক্ষর রেখে চলেছেন, তাঁরা আমাদের গর্ব।",
              "Those who have carried forward the legacy of our institution through notable achievements across diverse fields."
            )}
          </p>
          <div className="mt-3">
            <p className="text-gray-500 text-[11px] md:text-xs max-w-2xl mx-auto italic bg-gray-50 py-1.5 px-3 rounded-lg border border-gray-100 inline-block">
              <span className="font-semibold text-emerald-700">{t("বি.দ্র: ", "Note: ")}</span>
              {t(
                "সকল কৃতি শিক্ষার্থীর নাম একসাথে সংযুক্ত করা সম্ভব হয়নি, তবে তাঁদের সকলের সফলতায় আমরা গর্বিত। এই তালিকাটি পর্যায়ক্রমে আপডেট হতে থাকবে।",
                "It's not possible to list all our outstanding alumni, but we are proud of everyone's success. This list will be updated periodically."
              )}
            </p>
          </div>
        </div>

        {/* Alumni Grid with Navy Blue Frames & Golden Badges */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {alumni.slice(0, 5).map((person) => (
            <div
              key={person.id}
              className="relative bg-white rounded-3xl p-5 text-center group transition-all duration-500 hover:-translate-y-2 border-2 border-slate-200/90 hover:border-[#051939] shadow-sm hover:shadow-2xl flex flex-col items-center justify-between overflow-hidden"
            >
              {/* Top Navy Blue Accent Line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#051939] via-blue-600 to-[#051939]" />

              {/* Top-Right Golden Award Medal Badge */}
              <div className="absolute top-3 right-3 text-amber-500 bg-amber-50/90 p-1.5 rounded-full border border-amber-200/80 shadow-xs">
                <FaAward size={13} />
              </div>

              {/* Navy Blue Frame with Inner Golden Badge */}
              <div className="relative mb-5 mt-1">
                <div className="relative p-1.5 rounded-full bg-gradient-to-tr from-[#051939] via-blue-700 to-[#051939] shadow-[0_0_18px_rgba(5,25,57,0.3)] group-hover:shadow-[0_0_30px_rgba(13,101,217,0.5)] group-hover:scale-105 transition-all duration-500">
                  <div className="p-0.5 bg-white rounded-full">
                    <div className="relative w-28 h-28 rounded-full overflow-hidden border-2 border-blue-200/80 bg-slate-100 shadow-inner">
                      <div className="absolute inset-0 bg-slate-100 flex items-center justify-center text-slate-300">
                        <FaGraduationCap size={44} />
                      </div>
                      {person.photo && (
                        <Image
                          src={person.photo}
                          alt={person.nameBengali}
                          fill
                          className="object-cover relative z-10 group-hover:scale-110 transition-transform duration-500 ease-out"
                          sizes="120px"
                        />
                      )}
                      {/* Subtle Inner Glass Vignette */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#051939]/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20" />
                    </div>
                  </div>
                </div>

                {/* Golden Badge Anchored on the Frame */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-white w-7 h-7 rounded-full shadow-md border-2 border-white z-30 flex items-center justify-center">
                  <FaGraduationCap size={13} />
                </div>
              </div>

              {/* Alumni Info */}
              <div className="flex-1 flex flex-col justify-between w-full">
                <div>
                  <h3 className="font-extrabold text-[#051939] group-hover:text-blue-700 transition-colors text-sm sm:text-base leading-snug line-clamp-1">
                    {language === "en" && person.nameEnglish ? person.nameEnglish : person.nameBengali}
                  </h3>
                  <div className="mt-2.5">
                    <span className="inline-block text-[11px] sm:text-xs font-bold px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-sm shadow-amber-500/25 border border-amber-300/40 line-clamp-1">
                      {person.degree}
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-gray-600 font-medium mt-2 leading-tight line-clamp-2">
                    {person.institution}
                  </p>
                </div>

                {/* Animated Bottom Navy Indicator */}
                <div className="w-8 group-hover:w-16 h-1 bg-gradient-to-r from-[#051939] to-blue-600 mx-auto mt-3.5 rounded-full transition-all duration-300 shadow-xs" />
              </div>
            </div>
          ))}
        </div>

        {/* See More Button */}
        {alumni.length > 0 && (
          <div className="mt-10 text-center">
            <a
              href="/alumni"
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-white border border-gray-200 text-gray-700 hover:text-[#06874A] hover:border-[#06874A] hover:bg-emerald-50 rounded-full font-medium text-sm transition-all duration-300 shadow-sm hover:shadow"
            >
              {language === "en" ? "See more" : "আরও দেখুন"}
              <span className="text-lg leading-none">&rarr;</span>
            </a>
          </div>
        )}
      </div>
    </section>
  );
}

