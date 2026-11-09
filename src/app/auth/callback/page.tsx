"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/AuthContext";
import { FaChalkboardTeacher, FaGraduationCap, FaCheckCircle, FaSpinner } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

export default function AuthCallbackPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [googleData, setGoogleData] = useState<{ email: string; name: string } | null>(null);

  // Form state for first-time onboarding
  const [selectedRole, setSelectedRole] = useState<"teacher" | "student">("student");
  const [selectedClass, setSelectedClass] = useState("class-10");
  const [submitting, setSubmitting] = useState(false);
  const processedRef = useRef(false);

  useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;

    async function handleAuth() {
      try {
        // 1. Check for errors in URL
        const params = new URLSearchParams(window.location.search);
        const errorDesc = params.get("error_description") || params.get("error");
        if (errorDesc) {
          throw new Error(decodeURIComponent(errorDesc));
        }

        // 2. Check for PKCE 'code' in URL query parameters
        const code = params.get("code");
        let activeSession = null;

        if (code) {
          try {
            const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
            if (exchangeError) {
              console.warn("exchangeCodeForSession error, falling back to getSession:", exchangeError);
            } else {
              activeSession = data.session;
            }
          } catch (e) {
            console.warn("exchangeCodeForSession exception:", e);
          }
        }

        // 3. If no session yet from code, check getSession()
        if (!activeSession) {
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          if (sessionError) throw sessionError;
          activeSession = session;
        }

        // 4. If session found immediately, process it
        if (activeSession?.user) {
          await verifyWithBackend(activeSession.user);
          return;
        }

        // 5. If still no session, listen to onAuthStateChange
        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
          if (currentSession?.user) {
            authListener.subscription.unsubscribe();
            await verifyWithBackend(currentSession.user);
          }
        });

        // Timeout fallback
        setTimeout(async () => {
          const { data: { session: retrySession } } = await supabase.auth.getSession();
          if (retrySession?.user) {
            await verifyWithBackend(retrySession.user);
          } else if (!isFirstTime) {
            setError("Google লগইন সেশন সনাক্ত করা যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।");
            setLoading(false);
          }
        }, 4000);
      } catch (err: any) {
        console.error("Auth callback error:", err);
        setError(err.message || "Google লগইনে ত্রুটি হয়েছে");
        setLoading(false);
      }
    }

    async function verifyWithBackend(user: any) {
      try {
        const email = user.email;
        const name =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          email?.split("@")[0] ||
          "ব্যবহারকারী";

        const res = await fetch("/api/auth/google/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, name }),
        });

        const data = await res.json();

        if (res.ok && data.exists && data.user) {
          // Already registered user -> directly redirect to their respective dashboard
          await refreshUser();
          if (data.user.role === "admin") {
            window.location.replace("/dashboard/admin");
          } else if (data.user.role === "teacher") {
            window.location.replace("/dashboard/teacher");
          } else {
            window.location.replace("/dashboard/student");
          }
        } else if (res.ok && data.isFirstTime) {
          // First time account creation -> prompt to choose role
          setIsFirstTime(true);
          setGoogleData({ email, name });
          setLoading(false);
        } else {
          setError(data.error || "যাচাইকরণ ব্যর্থ হয়েছে");
          setLoading(false);
        }
      } catch (err: any) {
        setError("সার্ভার যাচাইকরণে ত্রুটি হয়েছে");
        setLoading(false);
      }
    }

    handleAuth();
  }, [router, refreshUser, isFirstTime]);

  const handleCompleteSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleData) return;

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/auth/google/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: googleData.email,
          name: googleData.name,
          role: selectedRole,
          class: selectedRole === "student" ? selectedClass : undefined,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        await refreshUser();
        if (selectedRole === "teacher") {
          window.location.replace("/dashboard/teacher");
        } else {
          window.location.replace("/dashboard/student");
        }
      } else {
        setError(data.error || "নিবন্ধন সম্পন্ন করা যায়নি");
        setSubmitting(false);
      }
    } catch (err: any) {
      setError("সার্ভার ত্রুটি। আবার চেষ্টা করুন।");
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-gray-50 flex items-center justify-center p-4 font-bengali">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        {loading ? (
          <div className="text-center py-10 space-y-4">
            <FaSpinner className="animate-spin text-4xl text-[#051939] mx-auto" />
            <h2 className="text-lg font-bold text-gray-800">Google অ্যাকাউন্ট যাচাই করা হচ্ছে...</h2>
            <p className="text-xs text-gray-500">অনুগ্রহ করে অপেক্ষা করুন</p>
          </div>
        ) : error ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
              ✕
            </div>
            <h2 className="text-lg font-bold text-gray-800">লগইন সম্পন্ন হয়নি</h2>
            <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
              {error}
            </p>
            <button
              onClick={() => router.push("/login")}
              className="w-full bg-[#051939] text-white py-2.5 rounded-lg text-sm font-bold hover:bg-[#800505] transition cursor-pointer"
            >
              লগইন পেজে ফিরে যান
            </button>
          </div>
        ) : isFirstTime && googleData ? (
          <div>
            <div className="text-center mb-6">
              <div className="inline-flex p-3 rounded-full bg-blue-50 mb-3 border border-blue-100 shadow-xs">
                <FcGoogle size={32} />
              </div>
              <h2 className="text-xl font-extrabold text-[#051939]">
                স্বাগতম, {googleData.name}!
              </h2>
              <p className="text-xs text-gray-500 mt-1 font-sans">{googleData.email}</p>
              <div className="w-12 h-1 bg-[#06874A] mx-auto mt-3 rounded-full"></div>
              <p className="text-sm text-gray-600 mt-3 font-medium">
                অ্যাকাউন্ট সম্পন্ন করতে আপনার ভূমিকা নির্বাচন করুন:
              </p>
            </div>

            <form onSubmit={handleCompleteSetup} className="space-y-5">
              {/* Role Selection Cards */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedRole("teacher")}
                  className={`p-4 rounded-xl border-2 text-center transition-all flex flex-col items-center gap-2 cursor-pointer ${
                    selectedRole === "teacher"
                      ? "border-[#06874A] bg-emerald-50/70 text-[#06874A] shadow-md ring-2 ring-emerald-200"
                      : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <FaChalkboardTeacher size={28} />
                  <span className="font-bold text-sm">শিক্ষক</span>
                  <span className="text-[11px] opacity-80">বিদ্যালয়ের শিক্ষক</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRole("student")}
                  className={`p-4 rounded-xl border-2 text-center transition-all flex flex-col items-center gap-2 cursor-pointer ${
                    selectedRole === "student"
                      ? "border-blue-600 bg-blue-50/70 text-blue-700 shadow-md ring-2 ring-blue-200"
                      : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <FaGraduationCap size={28} />
                  <span className="font-bold text-sm">শিক্ষার্থী</span>
                  <span className="text-[11px] opacity-80">অধ্যয়নরত ছাত্র/ছাত্রী</span>
                </button>
              </div>

              {/* Class selection if student */}
              {selectedRole === "student" && (
                <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 animate-fadeIn">
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    আপনার শ্রেণি নির্বাচন করুন:
                  </label>
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="class-6">ষষ্ঠ শ্রেণি (Class 6)</option>
                    <option value="class-7">সপ্তম শ্রেণি (Class 7)</option>
                    <option value="class-8">অষ্টম শ্রেণি (Class 8)</option>
                    <option value="class-9">নবম শ্রেণি (Class 9)</option>
                    <option value="class-10">দশম শ্রেণি (Class 10)</option>
                  </select>
                </div>
              )}

              <p className="text-[11px] text-gray-400 text-center leading-relaxed">
                ℹ️ এই নির্বাচনটি শুধুমাত্র প্রথমবার একাউন্ট খোলার সময় প্রয়োজন হবে। পরবর্তীতে সরাসরি লগইন হবে।
              </p>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#051939] text-white py-3 rounded-xl font-bold hover:bg-[#06874A] transition-colors shadow-md disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <FaSpinner className="animate-spin" /> সম্পন্ন হচ্ছে...
                  </>
                ) : (
                  <>
                    <FaCheckCircle /> অ্যাকাউন্ট সম্পন্ন করুন
                  </>
                )}
              </button>
            </form>
          </div>
        ) : null}
      </div>
    </div>
  );
}
