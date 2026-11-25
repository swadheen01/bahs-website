"use client";
import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { FaArrowLeft, FaChair, FaTools } from "react-icons/fa";

// Tools available to admins and teachers. Add new tools to this list.
const TOOLS = [
  {
    title: "আসন বিন্যাস টোকেন",
    desc: "পরীক্ষার সিট প্ল্যানের Excel ফাইল দিয়ে প্রতিটি শিক্ষার্থীর জন্য প্রিন্টযোগ্য আসন টোকেন (PDF) তৈরি করুন",
    icon: <FaChair size={28} className="text-emerald-600" />,
    href: "/dashboard/tools/seat-token",
    badge: "PDF",
    color: "border-emerald-500 hover:border-emerald-600",
  },
];

export default function ToolsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || (user.role !== "admin" && user.role !== "teacher"))) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading || !user || (user.role !== "admin" && user.role !== "teacher")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 font-bengali text-lg">লোড হচ্ছে...</p>
      </div>
    );
  }

  const dashboardHref = user.role === "admin" ? "/dashboard/admin" : "/dashboard/teacher";

  return (
    <div className="min-h-screen bg-gray-100 font-bengali">
      <header className="bg-[#051939] text-white px-6 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
            <FaTools size={18} className="text-yellow-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold">টুলস</h1>
            <p className="text-xs text-gray-300">এডমিন ও শিক্ষকদের জন্য সহায়ক টুল</p>
          </div>
        </div>
        <Link href={dashboardHref} className="bg-white/10 hover:bg-white/20 text-xs px-3 py-2 rounded-lg flex items-center gap-1">
          <FaArrowLeft /> ড্যাশবোর্ড
        </Link>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TOOLS.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className={`bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border-l-4 ${tool.color} flex flex-col justify-between group`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gray-50 rounded-xl group-hover:scale-110 transition-transform">{tool.icon}</div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{tool.badge}</span>
                </div>
                <h3 className="text-lg font-bold text-gray-800 group-hover:text-[#06874A] transition-colors mb-2">{tool.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{tool.desc}</p>
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
