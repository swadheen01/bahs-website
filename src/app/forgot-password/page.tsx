"use client";
import { useState } from "react";
import Link from "next/link";
import { FaKey, FaEnvelope, FaArrowLeft, FaCheckCircle, FaInfoCircle, FaSpinner } from "react-icons/fa";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/lib/LanguageContext";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const { t } = useLanguage();

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const redirectUrl = `${window.location.origin}/reset-password`;
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: redirectUrl,
      });

      if (resetError) {
        if (resetError.message?.toLowerCase().includes("rate limit")) {
          setError(t("অতিরিক্ত অনুরোধ করা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।", "Too many requests. Please try again later."));
        } else {
          setError(resetError.message || t("রিসেট লিংক পাঠাতে সমস্যা হয়েছে।", "Failed to send reset link."));
        }
      } else {
        setSuccess(true);
      }
    } catch (err: any) {
      setError(t("সার্ভার ত্রুটি। আবার চেষ্টা করুন।", "Server error. Please try again."));
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
            <FaKey size={26} />
          </div>
          <h1 className="text-2xl font-bold text-[#051939]">
            {t("পাসওয়ার্ড পুনরুদ্ধার", "Reset Password")}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {t("বানিয়াচং আদর্শ উচ্চ বিদ্যালয়", "Baniyachong Adarsha High School")}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 border-t-4 border-[#051939]">
          {success ? (
            <div className="text-center py-4 space-y-4">
              <FaCheckCircle className="text-green-500 text-5xl mx-auto" />
              <h2 className="text-lg font-bold text-gray-800">
                {t("রিসেট লিংক পাঠানো হয়েছে!", "Reset Link Sent!")}
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed bg-green-50 p-4 rounded-xl border border-green-200">
                {t(
                  `আমরা "${email}" ঠিকানায় একটি পাসওয়ার্ড রিসেট লিংক পাঠিয়েছি। অনুগ্রহ করে আপনার ইমেইল ইনবক্স (অথবা স্প্যাম ফোল্ডার) চেক করে নতুন পাসওয়ার্ড সেট করুন।`,
                  `We have sent a password reset link to "${email}". Please check your inbox (or spam folder) to set a new password.`
                )}
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm font-bold text-[#051939] hover:text-[#800505] transition mt-2"
              >
                <FaArrowLeft /> {t("লগইন পেজে ফিরে যান", "Back to Login")}
              </Link>
            </div>
          ) : (
            <form onSubmit={handleResetRequest} className="space-y-5">
              <p className="text-sm text-gray-600 leading-relaxed">
                {t(
                  "আপনার অ্যাকাউন্টের সাথে যুক্ত ইমেইল ঠিকানা দিন। আমরা আপনাকে পাসওয়ার্ড রিসেট করার লিংক পাঠিয়ে দেব।",
                  "Enter the email associated with your account and we will send you a password reset link."
                )}
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("ইমেইল ঠিকানা", "Email Address")}
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@gmail.com"
                    required
                    className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#051939] text-sm"
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
                className="w-full bg-[#051939] text-white font-semibold py-3 rounded-lg hover:bg-[#800505] transition-colors duration-200 disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin" /> {t("পাঠানো হচ্ছে...", "Sending...")}
                  </>
                ) : (
                  t("পাসওয়ার্ড রিসেট লিংক পাঠান →", "Send Reset Link →")
                )}
              </button>

              {/* Admin Support Box */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-6 text-xs text-amber-900 flex items-start gap-3">
                <FaInfoCircle className="text-amber-600 shrink-0 mt-0.5 text-base" />
                <div className="leading-relaxed">
                  <p className="font-bold mb-1">
                    {t("ইউজারনেম ব্যবহারকারীদের জন্য:", "For Username Accounts:")}
                  </p>
                  <p className="text-amber-800">
                    {t(
                      "আপনি যদি সাধারণ ইউজারনেম দিয়ে রেজিস্ট্রেশন করে থাকেন এবং ইমেইল যুক্ত না থাকে, তবে বিদ্যালয় প্রধান অ্যাডমিনের সাথে যোগাযোগ করুন। অ্যাডমিন তাঁর ড্যাশবোর্ড থেকে সরাসরি আপনার পাসওয়ার্ড রিসেট করে দিতে পারবেন।",
                      "If you registered with a username without an email, please contact the school administrator. The admin can reset your password directly from the admin dashboard."
                    )}
                  </p>
                </div>
              </div>

              <div className="text-center pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#051939] font-medium transition"
                >
                  <FaArrowLeft size={12} /> {t("লগইন পেজে ফিরে যান", "Back to Login")}
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

