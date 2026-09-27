"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FaBell, FaImages, FaChalkboardTeacher, FaTrophy,
  FaSignOutAlt, FaHome, FaPlus, FaExternalLinkAlt
} from "react-icons/fa";

const adminMenus = [
  {
    title: "নোটিশ যোগ/সম্পাদনা",
    desc: "নতুন নোটিশ যোগ করুন বা পুরোনো নোটিশ সম্পাদনা করুন",
    icon: FaBell,
    href: "/admin/notices",
    color: "bg-[#800505]",
  },
  {
    title: "ছবি আপলোড",
    desc: "গ্যালারিতে নতুন ছবি আপলোড করুন",
    icon: FaImages,
    href: "/admin/gallery",
    color: "bg-[#1877F2]",
  },
  {
    title: "শিক্ষক প্রোফাইল",
    desc: "শিক্ষকদের প্রোফাইল আপডেট করুন",
    icon: FaChalkboardTeacher,
    href: "/admin/teachers",
    color: "bg-[#06874A]",
  },
  {
    title: "ফলাফল আপলোড",
    desc: "পরীক্ষার ফলাফল আপলোড করুন",
    icon: FaTrophy,
    href: "/admin/results",
    color: "bg-[#965D03]",
  },
];

export default function AdminDashboard() {
  const router = useRouter();
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const auth = localStorage.getItem("bahs_admin_auth");
    if (auth !== "true") {
      router.push("/admin/login");
    } else {
      setIsAuth(true);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("bahs_admin_auth");
    router.push("/admin/login");
  };

  if (!isAuth) return null;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Admin Header */}
      <header className="bg-[#051939] text-white px-6 py-4 flex items-center justify-between shadow-lg">
        <div>
          <h1 className="text-lg font-bold font-bengali">এডমিন ড্যাশবোর্ড</h1>
          <p className="text-gray-400 text-xs font-bengali">বানিয়াচং আদর্শ উচ্চ বিদ্যালয়</p>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="/"
            target="_blank"
            className="flex items-center gap-1.5 text-gray-300 hover:text-white text-sm font-bengali"
          >
            <FaExternalLinkAlt size={12} />
            ওয়েবসাইট দেখুন
          </a>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-[#800505] px-4 py-2 rounded-lg text-sm font-bengali hover:bg-red-700 transition-colors"
          >
            <FaSignOutAlt />
            লগআউট
          </button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-[#051939] font-bengali">স্বাগতম, Admin!</h2>
          <p className="text-gray-500 font-bengali text-sm">নিচের যেকোনো বিভাগে ক্লিক করে কাজ শুরু করুন।</p>
        </div>

        {/* Admin Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {adminMenus.map((menu) => {
            const Icon = menu.icon;
            return (
              <Link
                key={menu.href}
                href={menu.href}
                className="bg-white rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group"
              >
                <div className={`${menu.color} p-5 flex items-center justify-center`}>
                  <Icon size={36} className="text-white" />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-[#051939] font-bengali">{menu.title}</h3>
                  <p className="text-xs text-gray-500 font-bengali mt-1">{menu.desc}</p>
                  <span className="inline-flex items-center gap-1 text-xs text-[#800505] font-bengali mt-3 group-hover:gap-2 transition-all">
                    <FaPlus size={10} /> শুরু করুন
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Quick Tips */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-5">
          <h3 className="font-bold text-blue-800 font-bengali mb-2">📌 তথ্য আপডেটের নির্দেশিকা</h3>
          <ul className="space-y-1 text-sm text-blue-700 font-bengali list-disc list-inside">
            <li>নোটিশ যোগ করতে: <code className="bg-blue-100 px-1 rounded">src/data/notices.json</code> ফাইল এডিট করুন</li>
            <li>শিক্ষকের তথ্য আপডেট করতে: <code className="bg-blue-100 px-1 rounded">src/data/teachers.json</code> ফাইল এডিট করুন</li>
            <li>ছবি যোগ করতে: <code className="bg-blue-100 px-1 rounded">public/images/</code> ফোল্ডারে ছবি রাখুন</li>
            <li>গ্যালারি আপডেট করতে: <code className="bg-blue-100 px-1 rounded">src/data/gallery.json</code> ফাইল এডিট করুন</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
