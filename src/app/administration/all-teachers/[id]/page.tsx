import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  FaUserCircle, FaArrowLeft, FaIdCard, FaBook, FaBriefcase,
  FaCalendarAlt, FaPhone, FaEnvelope, FaHome, FaMapMarkerAlt,
  FaGraduationCap, FaHeart, FaUserFriends, FaClock,
} from "react-icons/fa";

export const dynamic = 'force-dynamic';

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

export default async function TeacherDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: teacher } = await supabase.from('teachers').select('*').eq('id', id).single();

  if (!teacher) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-gray-50">
        <h2 className="text-2xl text-gray-500 font-bengali mb-4">শিক্ষকের তথ্য পাওয়া যায়নি</h2>
        <Link href="/administration/all-teachers" className="text-blue-600 hover:underline">← ফিরে যান</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <Link
          href="/administration/all-teachers"
          className="inline-flex items-center gap-2 mb-8 text-[#06874A] hover:text-[#051939] transition-colors font-bengali font-medium bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100"
        >
          <FaArrowLeft /> সকল শিক্ষকমণ্ডলীর তালিকায় ফিরে যান
        </Link>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          {/* Top Banner */}
          <div className="bg-[#051939] px-8 py-6 flex flex-col sm:flex-row items-center sm:items-end gap-6">
            {/* Photo */}
            <div className="w-32 h-40 rounded-xl overflow-hidden border-4 border-white/20 shadow-xl bg-gray-700 relative shrink-0">
              {teacher.photo ? (
                <Image
                  src={teacher.photo}
                  alt={teacher.name_bengali}
                  fill
                  className="object-cover object-top"
                  sizes="128px"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                  <FaUserCircle size={70} className="opacity-50" />
                </div>
              )}
            </div>
            {/* Name & Designation */}
            <div className="text-center sm:text-left text-white pb-1">
              <h1 className="text-2xl sm:text-3xl font-bold font-sans tracking-wide">{teacher.name_english || teacher.name_bengali}</h1>
              <p className="text-lg font-bengali text-gray-200 mt-1">{teacher.name_bengali}</p>
              <div className="mt-2">
                <span className="inline-block bg-[#06874A] text-white text-sm font-bold px-4 py-1 rounded-full font-sans">
                  {teacher.designation_en || teacher.designation}
                </span>
              </div>
            </div>
          </div>

          {/* Profile Details Grid */}
          <div className="p-6 sm:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

              {/* Left Column */}
              <div className="bg-gray-50 rounded-xl p-5 space-y-0">
                <h3 className="text-xs font-bold text-[#051939] uppercase tracking-widest mb-3 pb-2 border-b border-gray-200">Personal Information</h3>
                <InfoRow icon={<FaIdCard />}      label="MPO Index Number" value={teacher.mpo_index} />
                <InfoRow icon={<FaCalendarAlt />} label="Joining Date"     value={teacher.joining_date} />
                <InfoRow icon={<FaCalendarAlt />} label="Birth Date"       value={teacher.birth_date} />
                <InfoRow icon={<FaUserFriends />} label="Father's Name"    value={teacher.father_name} />
                <InfoRow icon={<FaUserFriends />} label="Mother's Name"    value={teacher.mother_name} />
              </div>

              {/* Right Column */}
              <div className="bg-gray-50 rounded-xl p-5 space-y-0">
                <h3 className="text-xs font-bold text-[#051939] uppercase tracking-widest mb-3 pb-2 border-b border-gray-200">Contact & Academic</h3>
                <InfoRow icon={<FaEnvelope />}       label="Email"         value={teacher.email} />
                <InfoRow icon={<FaPhone />}           label="Contact No."  value={teacher.contact_no} mono />
                <InfoRow icon={<FaGraduationCap />}  label="Qualification" value={teacher.qualification} />
                <InfoRow icon={<FaClock />}           label="Experience"   value={teacher.experience} />
                <InfoRow icon={<FaHeart />}           label="Interest"     value={teacher.interest} />
                <InfoRow icon={<FaBook />}            label="Subject"      value={teacher.subject} />
              </div>
            </div>

            {/* Address Section */}
            {(teacher.present_address || teacher.permanent_address) && (
              <div className="mt-6 bg-gray-50 rounded-xl p-5 space-y-0">
                <h3 className="text-xs font-bold text-[#051939] uppercase tracking-widest mb-3 pb-2 border-b border-gray-200">Address</h3>
                <InfoRow icon={<FaHome />}       label="Present Address"   value={teacher.present_address} />
                <InfoRow icon={<FaMapMarkerAlt />} label="Permanent Address" value={teacher.permanent_address} />
              </div>
            )}

            {/* Category Badge */}
            <div className="mt-6 flex items-center gap-3">
              <FaBriefcase className="text-gray-400" />
              <span className="text-sm text-gray-500 font-bengali">
                {teacher.category === 'management' ? 'ব্যবস্থাপনা ও স্টাফ' : 'সাধারণ শিক্ষক'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
