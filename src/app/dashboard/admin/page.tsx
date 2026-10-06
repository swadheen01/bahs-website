"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FaUserShield,
  FaChalkboardTeacher,
  FaTrophy,
  FaImages,
  FaBullhorn,
  FaUsers,
  FaSignOutAlt,
  FaImage,
  FaHome,
  FaLayerGroup,
  FaUserTie,
  FaGraduationCap,
  FaAward,
  FaClock,
  FaCalendarAlt,
  FaLandmark,
  FaBell
} from "react-icons/fa";

export default function AdminDashboardPage() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [pendingTeacherEdits, setPendingTeacherEdits] = useState(0);

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.role === "admin") {
      fetch("/api/teachers/pending-count", { cache: "no-store" })
        .then(res => res.json())
        .then(data => setPendingTeacherEdits(data.count || 0))
        .catch(() => {});
    }
  }, [user]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 font-bengali text-lg">লোড হচ্ছে...</p>
      </div>
    );
  }

  const adminModules = [
    {
      title: "নোটিশ বোর্ড ব্যবস্থাপনা",
      desc: "জরুরী বা সাধারণ নোটিশ আপলোড ও ম্যানেজ করুন",
      icon: <FaBullhorn size={28} className="text-amber-600" />,
      href: "/dashboard/admin/notices",
      badge: "নোটিশ",
      color: "border-amber-500 hover:border-amber-600"
    },
    {
      title: "হিরো স্লাইডার ব্যবস্থাপনা",
      desc: "মূল পেজের বড় স্লাইডারের ছবি এবং টাইটেল আপডেট করুন",
      icon: <FaImage size={28} className="text-blue-600" />,
      href: "/dashboard/admin/sliders",
      badge: "স্লাইডার",
      color: "border-blue-500 hover:border-blue-600"
    },
    {
      title: "ফটো গ্যালারি পোস্ট",
      desc: "বিদ্যালয়ের কার্যক্রমের ছবি ও ক্যাপশন পোস্ট করুন",
      icon: <FaImages size={28} className="text-pink-600" />,
      href: "/dashboard/admin/gallery",
      badge: "গ্যালারি",
      color: "border-pink-500 hover:border-pink-600"
    },
    {
      title: "পরীক্ষার ফলাফল ব্যবস্থাপনা",
      desc: "৬ষ্ঠ-১০ম শ্রেণির অভ্যন্তরীণ পরীক্ষার ফলাফল ও জেকেসি/এসএসসি ফলাফল আপলোড ও রেজাল্ট শিট পরিচালনা",
      icon: <FaGraduationCap size={28} className="text-emerald-600" />,
      href: "/dashboard/admin/results",
      badge: "রেজাল্ট",
      color: "border-emerald-500 hover:border-emerald-600"
    },
    {
      title: "ক্লাস রুটিন ও সময়সূচি",
      desc: "বার্ষিক ক্লাস রুটিন PDF আপলোড এবং ৬ষ্ঠ-১০ম শ্রেণির সাপ্তাহিক রুটিন টেবিল পরিচালনা করুন",
      icon: <FaClock size={28} className="text-cyan-600" />,
      href: "/dashboard/admin/routine",
      badge: "রুটিন",
      color: "border-cyan-500 hover:border-cyan-600"
    },
    {
      title: "বার্ষিক ছুটির তালিকা ও শিক্ষাপঞ্জি",
      desc: "অফিসিয়াল ছুটির তালিকা PDF আপলোড ও সকল জাতীয় ও ধর্মীয় ছুটির দিন পরিচালনা করুন",
      icon: <FaCalendarAlt size={28} className="text-red-600" />,
      href: "/dashboard/admin/holidays",
      badge: "ছুটি",
      color: "border-red-500 hover:border-red-600"
    },
    {
      title: "শিক্ষক ব্যবস্থাপনা",
      desc: "সকল শিক্ষকের তথ্য ও ছবি যোগ, পরিবর্তন বা মুছে ফেলুন",
      icon: (
        <div className="relative">
          <FaChalkboardTeacher size={28} className="text-green-600" />
          {pendingTeacherEdits > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center">
              {pendingTeacherEdits}
            </span>
          )}
        </div>
      ),
      href: "/dashboard/admin/teachers",
      badge: pendingTeacherEdits > 0 ? `${pendingTeacherEdits} পরিবর্তন` : "CRUD",
      color: "border-green-500 hover:border-green-600"
    },
    {
      title: "কর্মচারী বৃন্দ ব্যবস্থাপনা",
      desc: "বিদ্যালয়ের সকল কর্মচারীর তথ্য ও ছবি পরিচালনা করুন",
      icon: <FaUserTie size={28} className="text-orange-600" />,
      href: "/dashboard/admin/staff",
      badge: "স্টাফ",
      color: "border-orange-500 hover:border-orange-600"
    },
    {
      title: "প্রাক্তন শিক্ষকবৃন্দ ব্যবস্থাপনা",
      desc: "প্রাক্তন প্রধান শিক্ষক ও সহকারী শিক্ষকদের তালিকা পরিচালনা করুন",
      icon: <FaUserTie size={28} className="text-teal-600" />,
      href: "/dashboard/admin/former-staff",
      badge: "প্রাক্তন",
      color: "border-teal-500 hover:border-teal-600"
    },
    {
      title: "ম্যানেজিং কমিটি ব্যবস্থাপনা",
      desc: "বিদ্যালয় পরিচালনা পরিষদের সভাপতি, দাতা, প্রতিষ্ঠাতা, শিক্ষক ও অভিভাবক প্রতিনিধিদের তালিকা এডিট করুন",
      icon: <FaLandmark size={28} className="text-violet-600" />,
      href: "/dashboard/admin/committee",
      badge: "কমিটি",
      color: "border-violet-500 hover:border-violet-600"
    },
    {
      title: "বক্তব্য ও ইতিহাস ব্যবস্থাপনা",
      desc: "প্রধান শিক্ষক ও সভাপতির বাণী, ছবি ও বিদ্যালয়ের বিস্তারিত ইতিহাস সম্পাদনা করুন",
      icon: <FaAward size={28} className="text-indigo-600" />,
      href: "/dashboard/admin/messages",
      badge: "বাণী ও ইতিহাস",
      color: "border-indigo-500 hover:border-indigo-600"
    },
    {
      title: "শ্রেণি তথ্য ও পরিসংখ্যান",
      desc: "৬ষ্ঠ-১০ম শ্রেণির শিক্ষক, শিক্ষার্থী সংখ্যা, রুটিন, বিষয় ও হোমপেজ পরিসংখ্যান এডিট করুন",
      icon: <FaLayerGroup size={28} className="text-teal-600" />,
      href: "/dashboard/admin/classes-stats",
      badge: "এডিটর",
      color: "border-teal-500 hover:border-teal-600"
    },
    {
      title: "ইউজার ও একাউন্ট ম্যানেজমেন্ট",
      desc: "শিক্ষক ও শিক্ষার্থী একাউন্টসমূহ দেখুন ও পরিচালনা করুন",
      icon: <FaUsers size={28} className="text-purple-600" />,
      href: "/dashboard/admin/users",
      badge: "ব্যবহারকারী",
      color: "border-purple-500 hover:border-purple-600"
    },
    {
      title: "কৃতি শিক্ষার্থী ব্যবস্থাপনা",
      desc: "সফল শিক্ষার্থীদের তালিকা ও ছবি পরিচালনা করুন",
      icon: <FaTrophy size={28} className="text-yellow-600" />,
      href: "/dashboard/admin/alumni",
      badge: "অ্যালামনাই",
      color: "border-yellow-500 hover:border-yellow-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-bengali">
      {/* Top Header */}
      <header className="bg-[#051939] text-white px-6 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
            <FaUserShield size={20} className="text-yellow-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold">এডমিন কন্ট্রোল প্যানেল</h1>
            <p className="text-xs text-gray-300">বানিয়াচং আদর্শ উচ্চ বিদ্যালয়</p>
          </div>
        </div>

        {/* Clean User Info & Notifications */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard/admin/teachers" className="relative p-2 text-white hover:text-amber-300 transition-colors bg-white/10 rounded-full">
            <FaBell size={18} />
            {pendingTeacherEdits > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center border border-[#051939]">
                {pendingTeacherEdits}
              </span>
            )}
          </Link>
          
          <div className="flex items-center gap-2.5 bg-white/10 border border-white/15 px-3.5 py-1.5 rounded-xl">
            <div className="w-7 h-7 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center text-xs">
              {user.name.charAt(0)}
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-white leading-tight">{user.name}</p>
              <span className="text-[10px] text-emerald-300 font-medium">প্রধান এডমিন</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[#051939]">ড্যাশবোর্ড ওভারভিউ</h2>
          <p className="text-sm text-gray-600 mt-1">
            নিচের অপশনগুলো থেকে আপনার প্রয়োজনীয় সেকশন নির্বাচন করুন।
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminModules.map((mod) => (
            <Link
              key={mod.title}
              href={mod.href}
              className={`bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border-l-4 ${mod.color} flex flex-col justify-between group`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gray-50 rounded-xl group-hover:scale-110 transition-transform">
                    {mod.icon}
                  </div>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${mod.badge.includes('পরিবর্তন') ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                    {mod.badge}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-800 group-hover:text-[#06874A] transition-colors mb-2">
                  {mod.title}
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {mod.desc}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-[#06874A] font-bold">
                <span>প্রবেশ করুন</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}

