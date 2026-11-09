"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaLock, FaEye, FaEyeSlash, FaCheckCircle, FaSpinner } from "react-icons/fa";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/lib/LanguageContext";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const { t } = useLanguage();
  const router = useRouter();

  useEffect(() => {
    async function checkRecoverySession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        setUserEmail(session.user.email);
      }
    }
    checkRecoverySession();
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError(t("পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।", "Password must be at least 6 characters."));
      return;
    }

    if (password !== confirmPassword) {
      setError(t("উভয় পাসওয়ার্ড মেলেনি।", "Passwords do not match."));
      return;
    }

    setLoading(true);

    try {
      // 1. Update in Supabase Auth
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        throw updateError;
      }

      // 2. Also update in local usersDB if email is available
      if (userEmail) {
        await fetch("/api/auth/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: userEmail, password }),
        });
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || t("পাসওয়ার্ড আপডেট করতে সমস্যা হয়েছে।", "Failed to update password."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] bg-gray-100 flex items-center justify-center py-12 px-4 font-bengali">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-[#051939] text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
            <FaLock size={26} />
          </div>
          <h1 className="text-2xl font-bold text-[#051939]">
            {t("নতুন পাসওয়ার্ড নির্ধারণ", "Set New Password")}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {t("বানিয়াচং আদর্শ উচ্চ বিদ্যালয়", "Baniyachong Adarsha High School")}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 border-t-4 border-[#06874A]">
          {success ? (
            <div className="text-center py-4 space-y-4">
              <FaCheckCircle className="text-green-500 text-5xl mx-auto" />
              <h2 className="text-lg font-bold text-gray-800">
                {t("পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে!", "Password Updated Successfully!")}
              </h2>
              <p className="text-sm text-gray-600">
                {t(
                  "আপনার নতুন পাসওয়ার্ড সেট করা হয়েছে। এখন নতুন পাসওয়ার্ড ব্যবহার করে লগইন করুন।",
                  "Your new password has been set. You can now sign in using your new credentials."
                )}
              </p>
              <button
                onClick={() => router.push("/login")}
                className="w-full bg-[#051939] text-white py-3 rounded-lg font-bold hover:bg-[#800505] transition shadow-md mt-4 cursor-pointer"
              >
                {t("লগইন পেজে যান →", "Proceed to Login →")}
              </button>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              {userEmail && (
                <div className="bg-blue-50 border border-blue-200 text-blue-800 text-xs px-3 py-2 rounded-lg font-sans">
                  অ্যাকাউন্ট: {userEmail}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("নতুন পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)", "New Password (min 6 chars)")}
                </label>
                <div className="relative">
                  <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t("নতুন পাসওয়ার্ড লিখুন", "Enter new password")}
                    required
                    className="w-full border border-gray-300 rounded-lg pl-10 pr-12 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#051939] text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("পাসওয়ার্ড নিশ্চিত করুন", "Confirm Password")}
                </label>
                <div className="relative">
                  <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={t("পুনরায় পাসওয়ার্ড লিখুন", "Re-enter new password")}
                    required
                    className="w-full border border-gray-300 rounded-lg pl-10 pr-12 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#051939] text-sm"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2.5 rounded-lg">
                  ⚠️ {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#051939] text-white font-semibold py-3 rounded-lg hover:bg-[#06874A] transition-colors duration-200 disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin" /> {t("আপডেট হচ্ছে...", "Updating...")}
                  </>
                ) : (
                  t("পাসওয়ার্ড সংরক্ষণ করুন →", "Save New Password →")
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

