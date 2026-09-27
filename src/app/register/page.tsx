"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaUserPlus, FaUser, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", username: "", password: "", role: "student", class: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        // Registration successful, redirect to login
        router.push("/login?registered=true");
      } else {
        setError(data.error || "অ্যাকাউন্ট তৈরি করতে সমস্যা হয়েছে");
      }
    } catch (err) {
      setError("সার্ভার ত্রুটি। আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] bg-gray-100 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-[#051939] text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaUserPlus size={28} />
          </div>
          <h1 className="text-2xl font-bold text-[#051939] font-bengali">অ্যাকাউন্ট খুলুন</h1>
          <p className="text-gray-500 font-bengali text-sm mt-1">
            বানিয়াচং আদর্শ উচ্চ বিদ্যালয়
          </p>
        </div>

        {/* Register Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 border-t-4 border-[#06874A]">
          <form onSubmit={handleRegister} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 font-bengali mb-1">পুরো নাম *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="আপনার নাম"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#051939] font-bengali"
              />
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 font-bengali mb-1">ইউজারনেম *</label>
              <input
                type="text"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                placeholder="ইংরেজিতে ইউজারনেম দিন"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#051939] font-bengali"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 font-bengali mb-1">পাসওয়ার্ড *</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="পাসওয়ার্ড লিখুন"
                  required
                  minLength={6}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#051939] font-bengali pr-12"
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

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 font-bengali mb-1">অ্যাকাউন্টের ধরন *</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#051939] font-bengali"
              >
                <option value="student">শিক্ষার্থী</option>
                <option value="teacher">শিক্ষক</option>
              </select>
            </div>

            {/* Class (if student) */}
            {form.role === "student" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 font-bengali mb-1">শ্রেণী *</label>
                <select
                  value={form.class}
                  onChange={(e) => setForm({ ...form, class: e.target.value })}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#051939] font-bengali"
                >
                  <option value="">নির্বাচন করুন</option>
                  {["6", "7", "8", "9", "10"].map(c => (
                    <option key={c} value={c}>{c}ষ্ঠ/তম শ্রেণী</option>
                  ))}
                </select>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-bengali px-4 py-2.5 rounded-lg">
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#06874A] text-white font-bengali font-semibold py-3 rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-60 mt-2"
            >
              {loading ? "অ্যাকাউন্ট খোলা হচ্ছে..." : "রেজিস্টার করুন"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 font-bengali mt-6">
            আগে থেকেই অ্যাকাউন্ট আছে?{" "}
            <Link href="/login" className="text-[#051939] font-bold hover:underline">
              লগইন করুন
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
