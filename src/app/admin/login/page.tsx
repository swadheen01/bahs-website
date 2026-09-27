"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaLock, FaEye, FaEyeSlash } from "react-icons/fa";

// Simple client-side auth (for production use a proper auth system)
const ADMIN_PASSWORD = "bahs@admin2025";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    setTimeout(() => {
      if (password === ADMIN_PASSWORD) {
        localStorage.setItem("bahs_admin_auth", "true");
        router.push("/admin/dashboard");
      } else {
        setError("পাসওয়ার্ড সঠিক নয়। আবার চেষ্টা করুন।");
        setLoading(false);
      }
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="bg-[#051939] text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaLock size={28} />
          </div>
          <h1 className="text-2xl font-bold text-[#051939] font-bengali">এডমিন প্যানেল</h1>
          <p className="text-gray-500 font-bengali text-sm mt-1">
            বানিয়াচং আদর্শ উচ্চ বিদ্যালয়
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 border-t-4 border-[#800505]">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 font-bengali mb-1">
                পাসওয়ার্ড
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="পাসওয়ার্ড লিখুন"
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#051939] focus:border-transparent font-bengali pr-12"
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
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#051939] text-white font-bengali font-semibold py-3 rounded-lg hover:bg-[#800505] transition-colors duration-200 disabled:opacity-60"
            >
              {loading ? "লগইন হচ্ছে..." : "লগইন করুন"}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 font-bengali mt-6">
            শুধুমাত্র অনুমোদিত কর্মকর্তাদের জন্য
          </p>
        </div>
      </div>
    </div>
  );
}
