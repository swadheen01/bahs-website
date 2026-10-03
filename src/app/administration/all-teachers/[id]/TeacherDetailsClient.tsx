"use client";
import Image from "next/image";
import Link from "next/link";
import {
  FaUserCircle, FaArrowLeft, FaIdCard, FaBook, FaBriefcase,
  FaCalendarAlt, FaPhone, FaEnvelope, FaHome, FaMapMarkerAlt,
  FaGraduationCap, FaHeart, FaUserFriends, FaClock,
} from "react-icons/fa";
import { useLanguage } from "@/lib/LanguageContext";

interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value?: string | null;
  mono?: boolean;
}

function InfoRow({ icon, label, value, mono }: InfoRowProps) {
  if (!value) return null;
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 py-3 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-2 min-w-[180px] text-gray-500">
        <span className="text-[#06874A] text-sm">{icon}</span>
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</span>
      </div>
      <span className={`text-sm font-semibold text-gray-800 ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}

export default function TeacherDetailsClient({ teacher }: { teacher: any }) {
  const { t, language } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <Link
          href="/administration/all-teachers"
          className="inline-flex items-center gap-2 mb-8 text-[#06874A] hover:text-[#051939] transition-colors font-medium bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100"
        >
          <FaArrowLeft />
          <span>{t("সকল শিক্ষকমণ্ডলীর তালিকায় ফিরে যান", "Back to All Faculty Members")}</span>
        </Link>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          {/* Top Banner with Navy Theme */}
          <div className="bg-gradient-to-r from-[#051939] via-[#0a2757] to-[#051939] px-8 py-8 flex flex-col sm:flex-row items-center sm:items-end gap-6 relative overflow-hidden">
            <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-white/5 pointer-events-none" />

            {/* Photo with Premium Navy Frame */}
            <div className="w-36 h-44 rounded-2xl overflow-hidden p-1.5 bg-gradient-to-b from-white/30 to-white/10 border-2 border-white/30 shadow-2xl relative shrink-0">
              <div className="w-full h-full rounded-xl overflow-hidden relative bg-gray-800 border border-white/20">
                {teacher.photo ? (
                  <Image
                    src={teacher.photo}
                    alt={teacher.name_bengali}
                    fill
                    className="object-cover object-top"
                    sizes="144px"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                    <FaUserCircle size={70} className="opacity-50" />
                  </div>
                )}
              </div>
            </div>

            {/* Name & Designation */}
            <div className="text-center sm:text-left text-white pb-1 flex-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-wide">
                {language === "en" && teacher.name_english ? teacher.name_english : teacher.name_bengali}
              </h1>
              {language !== "en" && teacher.name_english && (
                <p className="text-sm text-gray-300 mt-0.5">{teacher.name_english}</p>
              )}
              {language === "en" && teacher.name_bengali && (
                <p className="text-sm text-gray-300 mt-0.5">{teacher.name_bengali}</p>
              )}
              <div className="mt-3">
                <span className="inline-block bg-[#06874A] text-white text-xs sm:text-sm font-bold px-4 py-1.5 rounded-full shadow">
                  {(language === "en" && teacher.designation_en ? teacher.designation_en : teacher.designation) + (teacher.main_subject ? ` (${teacher.main_subject})` : "")}
                </span>
              </div>
            </div>
          </div>

          {/* Profile Details Grid */}
          <div className="p-6 sm:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="bg-gray-50 rounded-xl p-5 space-y-0 border border-gray-100">
                <h3 className="text-xs font-bold text-[#051939] uppercase tracking-widest mb-3 pb-2 border-b border-gray-200">
                  {t("ব্যক্তিগত তথ্য", "Personal Information")}
                </h3>
                <InfoRow icon={<FaIdCard />} label={t("এমপিও ইনডেক্স", "MPO Index Number")} value={teacher.mpo_index} />
                <InfoRow icon={<FaCalendarAlt />} label={t("যোগদানের তারিখ", "Joining Date")} value={teacher.joining_date} />
                <InfoRow icon={<FaCalendarAlt />} label={t("জন্ম তারিখ", "Birth Date")} value={teacher.birth_date} />
              </div>

              {/* Right Column */}
              <div className="bg-gray-50 rounded-xl p-5 space-y-0 border border-gray-100">
                <h3 className="text-xs font-bold text-[#051939] uppercase tracking-widest mb-3 pb-2 border-b border-gray-200">
                  {t("যোগাযোগ ও শিক্ষা", "Contact & Academic")}
                </h3>
                <InfoRow icon={<FaEnvelope />} label={t("ইমেইল", "Email")} value={teacher.email} />
                <InfoRow icon={<FaPhone />} label={t("যোগাযোগ নম্বর", "Contact No.")} value={teacher.contact_no} mono />
                <InfoRow icon={<FaGraduationCap />} label={t("শিক্ষাগত যোগ্যতা", "Qualification")} value={teacher.qualification} />
                <InfoRow icon={<FaBook />} label={t("প্রধান বিষয়", "Main Subject")} value={teacher.main_subject} />
                <InfoRow icon={<FaClock />} label={t("অভিজ্ঞতা", "Experience")} value={teacher.experience} />
                <InfoRow icon={<FaHeart />} label={t("বিশেষ আগ্রহ", "Interest")} value={teacher.interest} />
                <InfoRow icon={<FaBook />} label={t("বিষয়", "Subject")} value={teacher.subject} />
                {teacher.courses && (
                  <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 py-3 border-b border-gray-100 last:border-0">
                    <div className="flex items-center gap-2 min-w-[180px] text-gray-500 pt-1">
                      <span className="text-[#06874A] text-sm"><FaBook /></span>
                      <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">{t("কোর্স ও প্রশিক্ষণ", "Courses & Training")}</span>
                    </div>
                    <div className="flex-1 text-sm font-semibold text-gray-800">
                      <ul className="list-disc list-inside space-y-1.5 ml-1 sm:ml-0">
                        {teacher.courses.split('\n').map((course: string, i: number) => (
                          <li key={i} className="leading-relaxed text-gray-700">{course.trim()}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Address Section */}
            {(teacher.present_address || teacher.permanent_address) && (
              <div className="mt-6 bg-gray-50 rounded-xl p-5 space-y-0 border border-gray-100">
                <h3 className="text-xs font-bold text-[#051939] uppercase tracking-widest mb-3 pb-2 border-b border-gray-200">
                  {t("ঠিকানা", "Address")}
                </h3>
                <InfoRow icon={<FaHome />} label={t("বর্তমান ঠিকানা", "Present Address")} value={teacher.present_address} />
                <InfoRow icon={<FaMapMarkerAlt />} label={t("স্থায়ী ঠিকানা", "Permanent Address")} value={teacher.permanent_address} />
              </div>
            )}

            {/* Category Badge */}
            <div className="mt-6 flex items-center gap-3">
              <FaBriefcase className="text-gray-400" />
              <span className="text-sm text-gray-500">
                {teacher.category === 'management'
                  ? t("ব্যবস্থাপনা ও স্টাফ", "Management & Staff")
                  : t("সাধারণ শিক্ষক", "General Faculty Member")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

