"use client";
import Image from "next/image";
import Link from "next/link";
import {
  FaUserCircle, FaArrowLeft, FaIdCard, FaBook, FaBriefcase,
  FaCalendarAlt, FaPhone, FaEnvelope, FaHome, FaMapMarkerAlt,
  FaGraduationCap, FaHeart, FaUserFriends, FaClock, FaEdit,
} from "react-icons/fa";
import { useLanguage } from "@/lib/LanguageContext";
import { useAuth } from "@/lib/AuthContext";

interface InfoCardProps {
  icon: React.ReactNode;
  label: string;
  value?: string | null;
  mono?: boolean;
  fullWidth?: boolean;
}

function InfoCard({ icon, label, value, mono, fullWidth }: InfoCardProps) {
  if (!value) return null;
  return (
    <div className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 p-5 flex items-start gap-4 ${fullWidth ? 'sm:col-span-2' : ''}`}>
      <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-[#06874A] shrink-0 border border-emerald-100">
        {icon}
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-500 mb-1 tracking-wide">{label}</p>
        <p className={`text-[15px] font-bold text-gray-800 leading-snug ${mono ? "font-mono" : ""}`}>
          {value}
        </p>
      </div>
    </div>
  );
}

export default function TeacherDetailsClient({ teacher }: { teacher: any }) {
  const { t, language } = useLanguage();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex justify-between items-center mb-8">
          <Link
            href="/administration/all-teachers"
            className="inline-flex items-center gap-2 text-[#06874A] hover:text-[#051939] transition-colors font-medium bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100"
          >
            <FaArrowLeft />
            <span>{t("সকল শিক্ষকমণ্ডলীর তালিকায় ফিরে যান", "Back to All Faculty Members")}</span>
          </Link>

          {(user?.role === "admin" || user?.role === "teacher") && (
            <Link
              href={user.role === "admin" ? `/dashboard/admin/teachers?editId=${teacher.id}` : `/dashboard/teacher?editId=${teacher.id}`}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-lg shadow transition-colors"
            >
              <FaEdit />
              <span>{t("এডিট করুন", "Edit Profile")}</span>
            </Link>
          )}
        </div>

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
          <div className="p-6 sm:p-10 bg-gray-50/50">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <InfoCard icon={<FaIdCard size={18} />} label={t("এমপিও ইনডেক্স নং", "MPO Index Number")} value={teacher.mpo_index} />
              <InfoCard icon={<FaCalendarAlt size={18} />} label={t("যোগদানের তারিখ", "Joining Date")} value={teacher.joining_date} />
              <InfoCard icon={<FaCalendarAlt size={18} />} label={t("জন্মতারিখ", "Birth Date")} value={teacher.birth_date} />
              <InfoCard icon={<FaIdCard size={18} />} label={t("জাতীয় পরিচয়পত্র নং", "NID No")} value={teacher.nid} />
              
              <InfoCard icon={<FaUserFriends size={18} />} label={t("পিতার নাম", "Father's Name")} value={teacher.father_name} />
              <InfoCard icon={<FaUserFriends size={18} />} label={t("মাতার নাম", "Mother's Name")} value={teacher.mother_name} />
              
              <InfoCard icon={<FaEnvelope size={18} />} label={t("ইমেইল", "Email")} value={teacher.email} />
              <InfoCard icon={<FaPhone size={18} />} label={t("মোবাইল নং", "Contact No.")} value={teacher.contact_no} mono />
              
              <InfoCard icon={<FaGraduationCap size={18} />} label={t("যোগ্যতা", "Qualification")} value={teacher.qualification} />
              <InfoCard icon={<FaClock size={18} />} label={t("অভিজ্ঞতা", "Experience")} value={teacher.experience} />
              <InfoCard icon={<FaBook size={18} />} label={t("প্রধান বিষয়", "Main Subject")} value={teacher.main_subject} />
              <InfoCard icon={<FaBook size={18} />} label={t("অন্যান্য বিষয়", "Other Subjects")} value={teacher.subject} />
              
              <InfoCard icon={<FaHeart size={18} />} label={t("আগ্রহ", "Interest")} value={teacher.interest} fullWidth />

              {teacher.courses && (
                <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 p-5 flex items-start gap-4 sm:col-span-2">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-[#06874A] shrink-0 border border-emerald-100">
                    <FaBook size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-2 tracking-wide">{t("কোর্স ও প্রশিক্ষণ", "Courses & Training")}</p>
                    <ul className="list-disc list-inside space-y-1.5 ml-1 text-[15px] font-bold text-gray-800">
                      {teacher.courses.split('\n').map((course: string, i: number) => (
                        <li key={i}>{course.trim()}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              <InfoCard icon={<FaHome size={18} />} label={t("বর্তমান ঠিকানা", "Present Address")} value={teacher.present_address} fullWidth />
              <InfoCard icon={<FaMapMarkerAlt size={18} />} label={t("স্থায়ী ঠিকানা", "Permanent Address")} value={teacher.permanent_address} fullWidth />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

