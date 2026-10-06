"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import initialCommittee from "@/data/committee.json";
import {
  FaUserTie,
  FaPhoneAlt,
  FaAward,
  FaCalendarAlt,
  FaLandmark,
  FaUsers,
  FaCheckCircle,
} from "react-icons/fa";
import { useLanguage } from "@/lib/LanguageContext";

export default function ManagingCommitteePage() {
  const { t, language } = useLanguage();
  const [members, setMembers] = useState<any[]>(initialCommittee);

  useEffect(() => {
    fetch("/api/committee")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.members) {
          setMembers(data.members);
        }
      })
      .catch(() => {});
  }, []);

  const president = members.find((m) => m.category === "সভাপতি" || m.designation?.includes("সভাপতি"));
  const secretary = members.find(
    (m) => m.category === "সদস্য সচিব" || m.designation?.includes("সদস্য সচিব")
  );
  const otherMembers = members.filter(
    (m) => m.id !== president?.id && m.id !== secretary?.id
  );

  return (
    <div className={`min-h-screen bg-gray-50 pb-20 ${language === "bn" ? "font-bengali" : "font-sans"}`}>
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-[#051939] via-[#092b5e] to-[#051939] text-white py-12 shadow-md">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
            <FaLandmark size={16} />
            <span>{t("প্রশাসনিক পরিচালনা পরিষদ", "School Governance")}</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">
            {t("বিদ্যালয় পরিচালনা কমিটি (ম্যানেজিং কমিটি)", "School Managing Committee (SMC)")}
          </h1>
          <p className="text-gray-300 text-xs sm:text-sm mt-2 flex items-center gap-2">
            <Link href="/" className="hover:text-yellow-300 transition-colors">
              {t("প্রচ্ছদ", "Home")}
            </Link>
            <span>&rsaquo;</span>
            <span>{t("প্রশাসন", "Administration")}</span>
            <span>&rsaquo;</span>
            <span className="text-yellow-300 font-bold">{t("ম্যানেজিং কমিটি", "Managing Committee")}</span>
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-6 max-w-6xl space-y-10 relative z-10">
        {/* Top 2 Key Leaders: President & Member Secretary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* President Card */}
          {president && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border-t-4 border-[#A53146] border-x border-b border-gray-100 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="bg-rose-100 text-rose-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    {t("সভাপতি, পরিচালনা পরিষদ", "President")}
                  </span>
                  <span className="text-xs text-gray-500 font-mono">
                    {president.term || "২০২৪ - ২০২৬"}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-5 mb-5">
                  <div className="w-24 h-28 sm:w-28 sm:h-32 rounded-2xl overflow-hidden border-4 border-rose-100 shadow-md bg-gray-100 shrink-0">
                    <img
                      src={president.photo || "/images/president/president.jpg"}
                      alt={president.name}
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                  <div className="text-center sm:text-left">
                    <h2 className="text-xl font-extrabold text-[#051939]">
                      {language === "en" ? president.nameEn || president.name : president.name}
                    </h2>
                    <p className="text-xs font-bold text-rose-700 mt-1">
                      {language === "en" ? president.designationEn || president.designation : president.designation}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {t("বানিয়াচং আদর্শ উচ্চ বিদ্যালয়", "Baniyachong Adarsha High School")}
                    </p>
                  </div>
                </div>

                {president.bio && (
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed text-justify mb-4">
                    {president.bio}
                  </p>
                )}
              </div>

              {president.phone && (
                <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-600">
                  <span className="font-semibold">{t("সরাসরি যোগাযোগ:", "Contact:")}</span>
                  <a
                    href={`tel:${president.phone}`}
                    className="font-bold text-emerald-700 flex items-center gap-1 font-mono hover:underline"
                  >
                    <FaPhoneAlt size={10} /> {president.phone}
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Member Secretary / Headmaster Card */}
          {secretary && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border-t-4 border-[#06874A] border-x border-b border-gray-100 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    {t("প্রধান শিক্ষক ও সদস্য সচিব", "Member Secretary")}
                  </span>
                  <span className="text-xs text-gray-500 font-mono">
                    {secretary.term || "পদাধিকারবলে"}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-5 mb-5">
                  <div className="w-24 h-28 sm:w-28 sm:h-32 rounded-2xl overflow-hidden border-4 border-emerald-100 shadow-md bg-gray-100 shrink-0">
                    <img
                      src={secretary.photo || "/images/teachers/headmaster.jpg"}
                      alt={secretary.name}
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                  <div className="text-center sm:text-left">
                    <h2 className="text-xl font-extrabold text-[#051939]">
                      {language === "en" ? secretary.nameEn || secretary.name : secretary.name}
                    </h2>
                    <p className="text-xs font-bold text-emerald-700 mt-1">
                      {language === "en" ? secretary.designationEn || secretary.designation : secretary.designation}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {t("বানিয়াচং আদর্শ উচ্চ বিদ্যালয়", "Baniyachong Adarsha High School")}
                    </p>
                  </div>
                </div>

                {secretary.bio && (
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed text-justify mb-4">
                    {secretary.bio}
                  </p>
                )}
              </div>

              {secretary.phone && (
                <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-600">
                  <span className="font-semibold">{t("সরাসরি যোগাযোগ:", "Contact:")}</span>
                  <a
                    href={`tel:${secretary.phone}`}
                    className="font-bold text-emerald-700 flex items-center gap-1 font-mono hover:underline"
                  >
                    <FaPhoneAlt size={10} /> {secretary.phone}
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Other Members Grid */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-gray-100 space-y-6">
          <div className="border-b border-gray-100 pb-4">
            <h2 className="text-lg sm:text-xl font-bold text-[#051939] flex items-center gap-2">
              <FaUsers className="text-[#06874A]" />
              {t("পরিচালনা পরিষদের সম্মানিত সদস্যবৃন্দ", "Honorable Committee Members")}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {t(
                "দাতা সদস্য, প্রতিষ্ঠাতা সদস্য, নির্বাচিত শিক্ষক ও অভিভাবক প্রতিনিধিবৃন্দ",
                "Donor, Founder, Teacher, and Guardian Representatives"
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {otherMembers.map((member: any) => (
              <div
                key={member.id}
                className="p-5 rounded-2xl bg-gray-50 border border-gray-200 hover:border-[#06874A] hover:bg-emerald-50/20 transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-14 h-16 rounded-xl overflow-hidden bg-gray-200 border border-gray-300 shrink-0">
                      <img
                        src={member.photo || "/images/teachers/default_avatar.png"}
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full inline-block mb-1">
                        {member.category}
                      </span>
                      <h3 className="font-extrabold text-sm text-[#051939] truncate">
                        {language === "en" ? member.nameEn || member.name : member.name}
                      </h3>
                      <p className="text-xs text-gray-500 font-medium">
                        {language === "en" ? member.designationEn || member.designation : member.designation}
                      </p>
                    </div>
                  </div>

                  {member.bio && (
                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                      {member.bio}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-gray-200/70 flex items-center justify-between text-xs text-gray-500">
                  <span className="font-mono text-[11px]">{member.term || "২০২৪ - ২০২৬"}</span>
                  {member.phone && (
                    <a
                      href={`tel:${member.phone}`}
                      className="font-bold text-emerald-700 font-mono hover:underline flex items-center gap-1"
                    >
                      <FaPhoneAlt size={10} /> {member.phone}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
