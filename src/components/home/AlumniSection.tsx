"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { FaGraduationCap } from "react-icons/fa";
import { useLanguage } from "@/lib/LanguageContext";

interface Alumni {
  id: number;
  nameBengali: string;
  nameEnglish?: string;
  institution: string;
  degree: string;
  photo?: string;
}

export default function AlumniSection() {
  const [alumni, setAlumni] = useState<Alumni[]>([]);
  const [showSection, setShowSection] = useState<boolean>(true);
  const { t, language } = useLanguage();

  useEffect(() => {
    fetch("/api/school-info")
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.showAlumniSection !== "undefined") {
          setShowSection(data.showAlumniSection);
        }
      })
      .catch(() => {});

    fetch("/api/alumni")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setAlumni(data);
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

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {alumni.slice(0, 5).map((person) => (
            <div key={person.id} className="glossy-card glossy-shine rounded-2xl p-4 text-center group transition-all duration-300 hover:-translate-y-2 border border-gray-200/80 shadow-sm hover:shadow-xl">
              <div className="relative w-28 h-28 mx-auto rounded-full overflow-hidden border-4 border-gray-100 shadow-sm mb-3 group-hover:border-[#06874A] transition-colors duration-300">
                <div className="absolute inset-0 bg-gray-200 flex items-center justify-center text-gray-400">
                  <FaGraduationCap size={40} />
                </div>
                {person.photo && (
                  <Image
                    src={person.photo}
                    alt={person.nameBengali}
                    fill
                    className="object-cover relative z-10"
                    sizes="120px"
                  />
                )}
              </div>
              <h3 className="font-bold text-[#051939] text-sm">
                {language === "en" && person.nameEnglish ? person.nameEnglish : person.nameBengali}
              </h3>
              <p className="text-xs text-[#06874A] mt-1 font-medium">{person.degree}</p>
              <p className="text-[11px] text-gray-500 mt-0.5 leading-tight">
                {person.institution}
              </p>
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
