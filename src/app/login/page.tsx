"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import Link from "next/link";
import { FaLock, FaUser, FaEye, FaEyeSlash, FaChalkboardTeacher, FaGraduationCap, FaCog } from "react-icons/fa";

const roleInfo = {
  admin: { label: "এডমিন", icon: FaCog, color: "text-red-600" },
  teacher: { label: "শিক্ষক", icon: FaChalkboardTeacher, color: "text-green-600" },
  student: { label: "শিক্ষার্থী", icon: FaGraduationCap, color: "text-blue-600" },
};

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const router = useRouter();

  if (user) {
    if (user.role === "admin") router.replace("/dashboard/admin");
    else if (user.role === "teacher") router.replace("/dashboard/teacher");
    else router.replace("/dashboard/student");
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await login(username, password);
    if (result.success) {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.user?.role === "admin") router.push("/dashboard/admin");
      else if (data.user?.role === "teacher") router.push("/dashboard/teacher");
      else router.push("/dashboard/student");
    } else {
      setError(result.error || "লগইন ব্যর্থ হয়েছে");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] bg-gray-100 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="bg-[#051939] text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaLock size={28} />
          </div>
          <h1 className="text-2xl font-bold text-[#051939] font-bengali">লগইন করুন</h1>
          <p className="text-gray-500 font-bengali text-sm mt-1">
            বানিয়াচং আদর্শ উচ্চ বিদ্যালয়
          </p>
        </div>

        <div className="flex justify-center gap-4 mb-6">
          {Object.entries(roleInfo).map(([key, val]) => {
            const Icon = val.icon;
            return (
              <div key={key} className="flex flex-col items-center gap-1">
                <div className={`bg-white rounded-full p-2.5 shadow-sm ${val.color}`}>
                  <Icon size={18} />
                </div>
                <span className="text-xs font-bengali text-gray-500">{val.label}</span>
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 border-t-4 border-[#800505]">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 font-bengali mb-1">ইউজারনেম</label>
              <div className="relative">
                <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="আপনার ইউজারনেম"
                  required
                  className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#051939] font-bengali"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 font-bengali mb-1">পাসওয়ার্ড</label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="পাসওয়ার্ড লিখুন"
                  required
                  className="w-full border border-gray-300 rounded-lg pl-10 pr-12 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#051939] font-bengali"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-bengali px-4 py-2.5 rounded-lg">
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#051939] text-white font-bengali font-semibold py-3 rounded-lg hover:bg-[#800505] transition-colors duration-200 disabled:opacity-60"
            >
              {loading ? "লগইন হচ্ছে..." : "লগইন করুন →"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 font-bengali mt-6">
            অ্যাকাউন্ট নেই?{" "}
            <Link href="/register" className="text-[#051939] font-bold hover:underline">
              নতুন অ্যাকাউন্ট খুলুন
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

