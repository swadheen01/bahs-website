"use client";
import { useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaGraduationCap, FaSignOutAlt, FaHome, FaBullhorn, FaBookOpen } from "react-icons/fa";

export default function StudentDashboardPage() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || (user.role !== "student" && user.role !== "admin"))) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-gray-100 font-bengali">
      <header className="bg-[#1e40af] text-white px-6 py-4 flex items-center justify-between shadow">
        <div className="flex items-center gap-3">
          <FaGraduationCap size={26} />
          <div>
            <h1 className="text-lg font-bold">শিক্ষার্থী পোর্টাল</h1>
            <p className="text-xs text-blue-100">স্বাগতম, {user.name} {user.class ? `(শ্রেণি: ${user.class})` : ""}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/" className="bg-white/10 hover:bg-white/20 text-xs px-3 py-2 rounded-lg flex items-center gap-1">
            <FaHome /> হোমপেজ
          </Link>
          <button
            onClick={() => { logout(); router.push("/login"); }}
            className="bg-red-600 hover:bg-red-700 text-xs px-3 py-2 rounded-lg flex items-center gap-1"
          >
            <FaSignOutAlt /> লগআউট
          </button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="text-xl font-bold text-[#051939] mb-2">স্বাগতম, {user.name}!</h2>
          <p className="text-sm text-gray-600">বানিয়াচং আদর্শ উচ্চ বিদ্যালয়ের শিক্ষার্থী পোর্টালে আপনার স্বাগতম।</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/notices" className="bg-white p-5 rounded-xl shadow border-l-4 border-amber-500 hover:shadow-md transition">
            <FaBullhorn size={24} className="text-amber-500 mb-2" />
            <h3 className="font-bold text-gray-800">বিদ্যালয়ের নোটিশ</h3>
            <p className="text-xs text-gray-500 mt-1">পরীক্ষা, ছুটির নোটিশ ও গুরুত্বপূর্ণ নোটিফিকেশন</p>
          </Link>
          <Link href="/academics/results" className="bg-white p-5 rounded-xl shadow border-l-4 border-emerald-500 hover:shadow-md transition">
            <FaBookOpen size={24} className="text-emerald-500 mb-2" />
            <h3 className="font-bold text-gray-800">পরীক্ষার ফলাফল</h3>
            <p className="text-xs text-gray-500 mt-1">টার্ম ও বার্ষিক পরীক্ষার রেজাল্ট দেখুন</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

