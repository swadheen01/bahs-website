"use client";
import { useState, useEffect } from "react";
import initialSchoolInfo from "@/data/school-info.json";
import Image from "next/image";
import {
  FaQuoteLeft,
  FaAward,
  FaLandmark,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaIdCard,
  FaPhoneAlt,
  FaEnvelope,
  FaBookOpen,
  FaCheckCircle,
  FaStar,
} from "react-icons/fa";
import { useLanguage } from "@/lib/LanguageContext";

export default function AboutPage() {
  const { t, language } = useLanguage();
  const [schoolInfo, setSchoolInfo] = useState<any>(initialSchoolInfo);

  useEffect(() => {
    fetch("/api/school-info")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.history) {
          setSchoolInfo(data);
        }
      })
      .catch(() => {});
  }, []);

  const historyText =
    language === "en"
      ? schoolInfo?.history?.english || schoolInfo?.history?.bengali
      : schoolInfo?.history?.bengali || schoolInfo?.history?.english;

  const headmaster = schoolInfo?.headmasterMessage || initialSchoolInfo.headmasterMessage;
  const president = schoolInfo?.presidentMessage || initialSchoolInfo.presidentMessage;

  const infoTable = [
    {
      labelBn: "প্রতিষ্ঠানের পুরো নাম",
      labelEn: "Full Name of Institution",
      val: language === "en" ? schoolInfo.name.english : schoolInfo.name.bengali,
    },
    {
      labelBn: "প্রতিষ্ঠাকাল",
      labelEn: "Date of Establishment",
      val: language === "en" ? "January 24, 1985" : schoolInfo.established,
    },
    {
      labelBn: "ঠিকানা ও অবস্থান",
      labelEn: "Address & Location",
      val: language === "en" ? schoolInfo.address.english : schoolInfo.address.bengali,
    },
    {
      labelBn: "EIIN নম্বর",
      labelEn: "EIIN Number",
      val: schoolInfo.eiin,
    },
    {
      labelBn: "বিদ্যালয় কোড",
      labelEn: "School Code",
      val: schoolInfo.schoolCode,
    },
    {
      labelBn: "শিক্ষা বোর্ড",
      labelEn: "Education Board",
      val: language === "en" ? "Sylhet Education Board" : "মাধ্যমিক ও উচ্চ মাধ্যমিক শিক্ষা বোর্ড, সিলেট",
    },
    {
      labelBn: "মোট ভূমির পরিমাণ",
      labelEn: "Total Land Area",
      val: language === "en" ? "2.52 Acres" : schoolInfo.totalArea,
    },
    {
      labelBn: "যোগাযোগ ফোন",
      labelEn: "Contact Phone",
      val: schoolInfo.phone,
    },
    {
      labelBn: "ইমেইল ঠিকানা",
      labelEn: "Email Address",
      val: schoolInfo.email,
    },
  ];

  return (
    <div className={`min-h-screen bg-gray-50 ${language === "bn" ? "font-bengali" : "font-sans"}`}>
      {/* Page Header Banner */}
      <div className="bg-gradient-to-r from-[#051939] via-[#092b5e] to-[#051939] text-white py-12 shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
            <FaLandmark />
            <span>{t("পরিচিতি ও ঐতিহ্য", "About & Heritage")}</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold">
            {t("প্রতিষ্ঠানের ইতিহাস ও বাণী", "Institutional History & Messages")}
          </h1>
          <p className="text-gray-300 text-xs sm:text-sm mt-2 flex items-center gap-2">
            <span>{t("প্রচ্ছদ", "Home")}</span>
            <span>&rsaquo;</span>
            <span className="text-yellow-300">{t("প্রতিষ্ঠান সম্পর্কে", "About Us")}</span>
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-6xl space-y-12">
        {/* History Section */}
        <section id="history" className="bg-white rounded-3xl shadow-md border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-[#051939] to-[#092b5e] text-white px-6 py-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-yellow-300">
                <FaBookOpen />
              </span>
              <div>
                <h2 className="text-lg md:text-xl font-bold">
                  {t("প্রতিষ্ঠানের গৌরবময় ইতিহাস", "Glorious History of BAHS")}
                </h2>
                <p className="text-xs text-gray-300">
                  {t("১৯৮৫ সাল থেকে গুণগত শিক্ষার আলোকবর্তিকা", "Beacon of Quality Education Since 1985")}
                </p>
              </div>
            </div>
            <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-3 py-1 rounded-full font-bold">
              {t("স্থাপিত: ২৪ জানুয়ারী, ১৯৮৫", "Est: Jan 24, 1985")}
            </span>
          </div>

          <div className="p-6 md:p-8 space-y-6">
            <div className="prose max-w-none text-gray-700 leading-relaxed text-sm md:text-base space-y-4 text-justify whitespace-pre-line">
              {historyText}
            </div>

            {/* Quick Facts Matrix */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <h3 className="text-base font-bold text-[#051939] mb-4 flex items-center gap-2">
                <FaIdCard className="text-[#06874A]" />
                {t("বিদ্যালয় সংক্রান্ত একনজরে তথ্য", "School at a Glance")}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {infoTable.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200/70 hover:bg-gray-100/70 transition"
                  >
                    <span className="text-xs font-bold text-[#051939]">
                      {language === "en" ? item.labelEn : itemBnOrEn(item, language)}
                    </span>
                    <span className="text-xs font-semibold text-gray-700 text-right">
                      {item.val}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Messages Grid: Headmaster and President */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* Headmaster Message */}
          <div
            id="headmaster"
            className="bg-white rounded-3xl shadow-md border-t-4 border-[#06874A] border-x border-b border-gray-100 overflow-hidden flex flex-col justify-between"
          >
            <div className="bg-gradient-to-r from-[#06874A] to-[#046336] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FaAward className="text-yellow-300 text-lg" />
                <h2 className="font-bold text-lg">{t("প্রধান শিক্ষকের বাণী", "Headmaster's Message")}</h2>
              </div>
              <span className="text-xs bg-white/20 px-2.5 py-0.5 rounded-full">BAHS</span>
            </div>

            <div className="p-6 md:p-8 flex-1 flex flex-col justify-between space-y-6">
              <div className="flex flex-col sm:flex-row items-center gap-5 pb-5 border-b border-gray-100">
                <div className="relative w-28 h-32 rounded-2xl overflow-hidden bg-gray-100 border-4 border-emerald-100 shadow-md shrink-0">
                  <img
                    src={headmaster.photo || "/images/teachers/headmaster.jpg"}
                    alt={headmaster.name}
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="text-lg font-extrabold text-[#051939]">
                    {language === "en" ? headmaster.nameEn || headmaster.name : headmaster.name}
                  </h3>
                  <p className="text-xs font-bold text-emerald-700 mt-0.5">
                    {language === "en" ? headmaster.designationEn || headmaster.designation : headmaster.designation}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {t("বানিয়াচং আদর্শ উচ্চ বিদ্যালয়", "Baniyachong Adarsha High School")}
                  </p>
                </div>
              </div>

              <div className="relative">
                <FaQuoteLeft className="text-emerald-200 text-3xl absolute -top-3 -left-2 -z-0 opacity-60" />
                <p className="relative z-10 text-xs md:text-sm text-gray-700 leading-relaxed text-justify whitespace-pre-line">
                  {language === "en" ? headmaster.messageEn || headmaster.message : headmaster.message}
                </p>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 font-medium">
                <span className="flex items-center gap-1 text-emerald-700 font-bold">
                  <FaCheckCircle /> {t("দায়িত্বশীল নেতৃত্ব", "Dedicated Leadership")}
                </span>
                <span>{t("বানিয়াচং, হবিগঞ্জ", "Baniyachong, Habiganj")}</span>
              </div>
            </div>
          </div>

          {/* President Message */}
          <div
            id="president"
            className="bg-white rounded-3xl shadow-md border-t-4 border-[#A53146] border-x border-b border-gray-100 overflow-hidden flex flex-col justify-between"
          >
            <div className="bg-gradient-to-r from-[#A53146] to-[#791f30] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FaStar className="text-yellow-300 text-lg" />
                <h2 className="font-bold text-lg">{t("সভাপতির বাণী", "President's Message")}</h2>
              </div>
              <span className="text-xs bg-white/20 px-2.5 py-0.5 rounded-full">SMC</span>
            </div>

            <div className="p-6 md:p-8 flex-1 flex flex-col justify-between space-y-6">
              <div className="flex flex-col sm:flex-row items-center gap-5 pb-5 border-b border-gray-100">
                <div className="relative w-28 h-32 rounded-2xl overflow-hidden bg-gray-100 border-4 border-rose-100 shadow-md shrink-0">
                  <img
                    src={president.photo || "/images/president/president.jpg"}
                    alt={president.name}
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div className="text-center sm:text-left">
                  <h3 className="text-lg font-extrabold text-[#051939]">
                    {language === "en" ? president.nameEn || president.name : president.name}
                  </h3>
                  <p className="text-xs font-bold text-rose-700 mt-0.5">
                    {language === "en"
                      ? president.designationEn || "President, Managing Committee"
                      : president.designation || "সভাপতি, ম্যানেজিং কমিটি"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {t("বানিয়াচং আদর্শ উচ্চ বিদ্যালয়", "Baniyachong Adarsha High School")}
                  </p>
                </div>
              </div>

              <div className="relative">
                <FaQuoteLeft className="text-rose-200 text-3xl absolute -top-3 -left-2 -z-0 opacity-60" />
                <p className="relative z-10 text-xs md:text-sm text-gray-700 leading-relaxed text-justify whitespace-pre-line">
                  {language === "en" ? president.messageEn || president.message : president.message}
                </p>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 font-medium">
                <span className="flex items-center gap-1 text-rose-700 font-bold">
                  <FaCheckCircle /> {t("দিকনির্দেশনামূলক পথচলা", "Guiding Vision")}
                </span>
                <span>{t("বানিয়াচং, হবিগঞ্জ", "Baniyachong, Habiganj")}</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function itemBnOrEn(item: any, lang: string) {
  return lang === "en" ? item.labelEn : item.labelBn;
}
