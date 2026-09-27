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
  const { t, language } = useLanguage();

  useEffect(() => {
    fetch("/api/alumni")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setAlumni(data);
        }
      })
      .catch(() => {});
  }, []);

  if (!alumni || alumni.length === 0) return null;

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
      </div>
    </section>
  );
}
