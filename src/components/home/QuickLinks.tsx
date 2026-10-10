"use client";
import Link from "next/link";
import {
  FaDownload,
  FaCalendarAlt,
  FaClock,
  FaTrophy,
  FaUmbrellaBeach,
  FaBell,
  FaImages,
  FaPhoneAlt,
} from "react-icons/fa";
import { useLanguage } from "@/lib/LanguageContext";

export default function QuickLinks() {
  const { t } = useLanguage();

  const links = [
    { label: t("নোটিশ", "Notices"), href: "/notices", icon: FaBell, color: "from-red-600 to-rose-700" },
    { label: t("রুটিন", "Routine"), href: "/academics/routine", icon: FaClock, color: "from-[#051939] to-blue-900" },
    { label: t("ফলাফল", "Results"), href: "/academics/results", icon: FaTrophy, color: "from-[#06874A] to-emerald-700" },
    { label: t("ক্যালেন্ডার", "Calendar"), href: "/academics/calendar", icon: FaCalendarAlt, color: "from-[#965D03] to-amber-700" },
    { label: t("ছুটির তালিকা", "Holidays"), href: "/academics/holidays", icon: FaUmbrellaBeach, color: "from-[#691475] to-purple-800" },
    { label: t("গ্যালারী", "Gallery"), href: "/gallery/photos", icon: FaImages, color: "from-[#1877F2] to-blue-600" },
    { label: t("ডাউনলোড", "Download"), href: "/academics/testimonial", icon: FaDownload, color: "from-[#2d7d46] to-green-700" },
    { label: t("যোগাযোগ", "Contact"), href: "/contact", icon: FaPhoneAlt, color: "from-gray-700 to-gray-900" },
  ];

  return (
    <section className="py-8 bg-gradient-to-r from-gray-50 via-white to-gray-50 border-y border-gray-200">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-3">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href + link.label}
                href={link.href}
                className="glossy-card glossy-shine flex flex-col items-center gap-2.5 p-3 rounded-2xl group transition-all duration-300"
              >
                <div
                  className={`bg-gradient-to-br ${link.color} w-11 h-11 md:w-13 md:h-13 rounded-xl flex items-center justify-center text-white shadow-md group-hover:scale-110 group-hover:shadow-xl transition-all duration-300`}
                >
                  <Icon size={19} />
                </div>
                <span className="text-xs text-gray-700 font-bold group-hover:text-[#06874A] text-center leading-tight transition-colors">
                  {link.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
