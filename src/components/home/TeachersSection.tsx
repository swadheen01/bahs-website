"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { FaUsers } from "react-icons/fa";
import { useLanguage } from "@/lib/LanguageContext";

interface Teacher {
  id: number;
  nameBengali: string;
  nameEnglish?: string;
  designation: string;
  subject?: string;
  category: string;
  photo?: string;
}

export default function TeachersSection() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const { t, language } = useLanguage();

  useEffect(() => {
    fetch("/api/teachers")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setTeachers(data.slice(0, 6));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section className="py-12 bg-gray-50 border-t border-gray-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-[#051939]">
            {t("আমাদের শিক্ষকমণ্ডলী", "Our Respected Faculty")}
          </h2>
          <div className="w-16 h-1 bg-[#800505] mx-auto mt-2 mb-3 rounded" />
          <p className="text-gray-600 text-xs md:text-sm">
            {t(
              "অভিজ্ঞ ও দক্ষ শিক্ষক-শিক্ষিকাদের তত্ত্বাবধানে আমাদের শিক্ষার্থীরা সুশিক্ষিত হচ্ছে",
              "Our students thrive under the mentorship of our dedicated and accomplished educators"
            )}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {teachers.map((teacher) => (
            <Link
              key={teacher.id}
              href={`/administration/all-teachers/${teacher.id}`}
              className="glossy-card glossy-shine rounded-2xl overflow-hidden hover:-translate-y-2 transition-all duration-300 text-center group block border border-gray-200/80 shadow-sm hover:shadow-xl"
            >
              <div className="relative w-full aspect-[4/5] bg-gray-100">
                {teacher.photo ? (
                  <Image
                    src={teacher.photo}
                    alt={teacher.nameBengali}
                    fill
                    className="object-cover object-top"
                    sizes="200px"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                    <FaUsers size={36} />
                  </div>
                )}
              </div>
              <div className="p-3">
                <h3 className="text-xs font-bold text-[#051939] group-hover:text-[#06874A] transition-colors leading-tight line-clamp-1">
                  {language === "en" && teacher.nameEnglish ? teacher.nameEnglish : teacher.nameBengali}
                </h3>
                <p className="text-[10px] text-gray-500 mt-1 line-clamp-1">
                  {teacher.designation}
                </p>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link
            href="/administration/all-teachers"
            className="inline-block bg-[#051939] hover:bg-[#06874A] text-white text-xs px-6 py-2.5 rounded-lg font-bold shadow transition-colors"
          >
            {t("সকল শিক্ষকমণ্ডলী দেখুন →", "View All Faculty Members →")}
          </Link>
        </div>
      </div>
    </section>
  );
}
