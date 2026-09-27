"use client";
import { useState, useEffect } from "react";
import schoolInfoData from "@/data/school-info.json";
import { FaSchool, FaUserGraduate, FaChalkboardTeacher, FaAward, FaLayerGroup } from "react-icons/fa";
import { useLanguage } from "@/lib/LanguageContext";

const iconMap: Record<string, React.ReactNode> = {
  calendar:  <FaSchool size={28} />,
  students:  <FaUserGraduate size={28} />,
  teachers:  <FaChalkboardTeacher size={28} />,
  award:     <FaAward size={28} />,
  classroom: <FaLayerGroup size={28} />,
};

const gradients = [
  "from-[#051939] via-[#092b5e] to-[#051939]",
  "from-[#06874A] via-[#0b9c59] to-[#046135]",
  "from-[#800505] via-[#a31515] to-[#690000]",
  "from-[#965D03] via-[#b5730a] to-[#734500]",
];

export default function StatsSection() {
  const { language } = useLanguage();
  const [stats, setStats] = useState(schoolInfoData.stats);

  useEffect(() => {
    fetch("/api/school-info")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.stats) {
          setStats(data.stats);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section className="py-10 bg-gradient-to-r from-gray-100 via-white to-gray-100 border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {stats.map((stat: any, i: number) => {
            const displayValue = language === "en" ? (stat.valueEn || stat.value) : stat.value;
            // If value is long (contains spaces/+), use smaller font
            const isLong = displayValue && displayValue.length > 6;
            return (
              <div
                key={i}
                className={`text-center p-5 rounded-2xl bg-gradient-to-br ${gradients[i % gradients.length]} text-white shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-white/20 glossy-shine`}
              >
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center text-yellow-300 shadow-inner">
                  {iconMap[stat.icon] ?? <FaLayerGroup size={28} />}
                </div>
                <div className={`font-extrabold tracking-tight leading-tight ${isLong ? "text-base md:text-lg" : "text-2xl md:text-3xl"}`}>
                  {displayValue}
                </div>
                <div className="text-xs text-gray-200 font-medium mt-1.5">
                  {language === "en" ? (stat.labelEn || stat.label) : stat.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
