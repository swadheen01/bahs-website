"use client";
import Image from "next/image";
import { FaGraduationCap, FaAward } from "react-icons/fa";
import { useLanguage } from "@/lib/LanguageContext";

interface Alumni {
  id: number;
  nameBengali: string;
  nameEnglish?: string;
  institution: string;
  degree: string;
  photo?: string;
  year?: string | null;
}

export default function AlumniListClient({ alumni }: { alumni: Alumni[] }) {
  const { t, language } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {/* Page Header */}
      <div className="bg-[#465b6a] pt-12 pb-16 shadow-inner">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            {t("কৃতি শিক্ষার্থীবৃন্দ", "Our Proud Alumni")}
          </h1>
          <div className="w-16 h-1 bg-[#06874A] mx-auto mt-4 mb-2 rounded-full"></div>
          <p className="text-gray-200 text-sm md:text-base max-w-2xl mx-auto">
            {t(
              "যাঁরা নিজেদের মেধা ও যোগ্যতায় বিভিন্ন ক্ষেত্রে সাফল্যের স্বাক্ষর রেখে চলেছেন, তাঁরা আমাদের গর্ব।",
              "Those who have carried forward the legacy of our institution through notable achievements across diverse fields."
            )}
          </p>
          <div className="mt-4">
            <p className="inline-block bg-black/20 text-gray-200 text-xs md:text-sm px-4 py-2 rounded-lg border border-white/10 italic">
              <span className="font-bold text-emerald-400">{t("বি.দ্র: ", "Note: ")}</span>
              {t(
                "সকল কৃতি শিক্ষার্থীর নাম একসাথে সংযুক্ত করা সম্ভব হয়নি, তবে তাঁদের সকলের সফলতায় আমরা গর্বিত। এই তালিকাটি পর্যায়ক্রমে আপডেট হতে থাকবে।",
                "It's not possible to list all our outstanding alumni, but we are proud of everyone's success. This list will be updated periodically."
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-8">
        {alumni.length === 0 ? (
          <div className="bg-white p-10 rounded-2xl shadow-md text-center">
            <p className="text-gray-500">
              {t("কোনো কৃতি শিক্ষার্থীর তথ্য পাওয়া যায়নি।", "No alumni records found.")}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {alumni.map((person) => (
              <div
                key={person.id}
                className="relative bg-gradient-to-b from-white via-amber-50/20 to-white rounded-3xl p-5 text-center group transition-all duration-500 hover:-translate-y-2 border-2 border-amber-200/70 hover:border-amber-400 shadow-[0_4px_20px_rgba(217,119,6,0.08)] hover:shadow-[0_16px_40px_rgba(217,119,6,0.22)] flex flex-col items-center justify-between overflow-hidden"
              >
                {/* Top Golden Accent Line */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 rounded-b-full shadow-sm" />

                {/* Top-Right Award Medal Badge */}
                <div className="absolute top-3 right-3 text-amber-500 bg-amber-50/90 p-1.5 rounded-full border border-amber-200/80 shadow-xs">
                  <FaAward size={13} />
                </div>

                {/* Golden Radiant Glow Frame (গোল্ডেন গ্লো ফ্রেম) */}
                <div className="relative p-1.5 rounded-full bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.4)] group-hover:shadow-[0_0_35px_rgba(245,158,11,0.7)] group-hover:scale-105 transition-all duration-500 mb-4">
                  <div className="p-0.5 bg-white rounded-full">
                    <div className="relative w-28 h-28 rounded-full overflow-hidden border-2 border-amber-200/80 bg-slate-100 shadow-inner">
                      <div className="absolute inset-0 bg-slate-100 flex items-center justify-center text-amber-300">
                        <FaGraduationCap size={44} />
                      </div>
                      {person.photo && (
                        <Image
                          src={person.photo}
                          alt={language === "en" && person.nameEnglish ? person.nameEnglish : person.nameBengali}
                          fill
                          className="object-cover relative z-10 group-hover:scale-110 transition-transform duration-500 ease-out"
                          sizes="120px"
                        />
                      )}
                      {/* Subtle Golden Shimmer Vignette */}
                      <div className="absolute inset-0 bg-gradient-to-t from-amber-500/15 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20" />
                    </div>
                  </div>
                </div>

                {/* Alumni Info */}
                <div className="flex-1 flex flex-col justify-between w-full">
                  <div>
                    <h3 className="font-extrabold text-[#051939] group-hover:text-amber-800 transition-colors text-base leading-snug line-clamp-1">
                      {language === "en" && person.nameEnglish ? person.nameEnglish : person.nameBengali}
                    </h3>
                    {person.nameEnglish && language !== "en" && (
                      <p className="text-xs text-amber-700/80 font-medium mt-0.5 line-clamp-1">
                        {person.nameEnglish}
                      </p>
                    )}

                    <div className="mt-2.5">
                      <span className="inline-block text-xs font-bold px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-sm shadow-amber-500/25 border border-amber-300/40 line-clamp-1">
                        {person.degree}
                      </span>
                    </div>

                    <p className="text-xs text-gray-600 font-medium mt-2 leading-tight line-clamp-2">
                      {person.institution}
                    </p>

                    {person.year && (
                      <div className="mt-2">
                        <span className="text-[11px] font-semibold text-amber-900 bg-amber-100/70 border border-amber-200/80 px-2.5 py-0.5 rounded-full inline-block">
                          {t(`ব্যাচ: ${person.year}`, `Batch: ${person.year}`)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Animated Bottom Golden Indicator */}
                  <div className="w-8 group-hover:w-16 h-1 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 mx-auto mt-3.5 rounded-full transition-all duration-300 shadow-xs" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
