"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";

export default function SplashScreen() {
  const [show, setShow] = useState<boolean>(true);
  const [fadeOut, setFadeOut] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleDismiss = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setFadeOut(true);
    try {
      sessionStorage.setItem("bahs_splash_v2", "true");
    } catch (e) {}

    setTimeout(() => {
      setShow(false);
      try {
        document.documentElement.classList.add("splash-hidden");
      } catch (e) {}
    }, 600);
  };

  useEffect(() => {
    // Check if the user has already seen the splash screen in this session
    try {
      const hasSeen = sessionStorage.getItem("bahs_splash_v2");
      if (hasSeen === "true") {
        setShow(false);
        return;
      }
    } catch (e) {
      // Ignore storage errors
    }

    // Smooth line fill-up loading (3 seconds total for comfortable reading of the welcome message)
    const duration = 3000;
    const intervalTime = 30;
    const totalSteps = duration / intervalTime;
    let step = 0;

    timerRef.current = setInterval(() => {
      step++;
      const currentPct = Math.min(100, Math.round((step / totalSteps) * 100));
      setProgress(currentPct);

      if (currentPct >= 100) {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        // Small pause at 100% completion so user perceives finish
        setTimeout(() => {
          handleDismiss();
        }, 220);
      }
    }, intervalTime);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  if (!show) return null;

  return (
    <div
      id="bahs-splash-screen"
      onClick={handleDismiss}
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-br from-[#051939] via-[#092b5e] to-[#030e20] text-white select-none cursor-pointer transition-all duration-700 ${
        fadeOut ? "opacity-0 scale-105 pointer-events-none" : "opacity-100 scale-100"
      }`}
    >
      {/* Background ambient decorative glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-blue-500/15 blur-3xl pointer-events-none animate-pulse" />

      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-lg">
        {/* Animated Central Logo */}
        <div className="relative mb-6">
          {/* Subtle Outer Glow Rings */}
          <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-yellow-400 opacity-40 blur-xl animate-spin-slow" />
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 bg-white rounded-full p-3 shadow-2xl border-4 border-white/80 flex items-center justify-center transform transition-transform hover:scale-105">
            <div className="relative w-full h-full">
              <Image
                src="/images/logo/logo.png"
                alt="BAHS Logo"
                fill
                priority
                className="object-contain p-1"
              />
            </div>
          </div>
        </div>

        {/* Welcome Text */}
        <div className="space-y-3 font-bengali">
          <span className="inline-block px-4 py-1 rounded-full text-xs sm:text-sm font-bold tracking-widest uppercase bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border border-emerald-400/30 shadow-inner">
            স্বাগতম • WELCOME
          </span>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-snug drop-shadow-md">
            বানিয়াচং আদর্শ উচ্চ বিদ্যালয়
          </h1>

          <p className="text-sm sm:text-base text-gray-200 font-medium">
            এর অফিসিয়াল ওয়েবসাইটে আপনাকে স্বাগতম
          </p>

          <div className="w-24 h-1 bg-gradient-to-r from-emerald-400 to-teal-400 mx-auto rounded-full mt-2" />

          <p className="text-xs text-yellow-300/90 font-sans tracking-wider pt-2">
            EIIN: 129344 | ESTD: 1985 | Baniyachong, HABIGANJ
          </p>
        </div>

        {/* Progress bar loader ("line fill up loading") & Quick Enter prompt */}
        <div className="mt-8 flex flex-col items-center gap-2.5 w-full">
          {/* Progress bar container */}
          <div className="w-64 sm:w-80 h-2.5 bg-white/20 rounded-full overflow-hidden p-0.5 border border-white/25 backdrop-blur-md shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 via-teal-300 to-yellow-300 rounded-full transition-[width] duration-75 ease-linear shadow-[0_0_12px_rgba(52,211,153,0.8)]"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Status info & Percentage */}
          <div className="flex items-center justify-between w-64 sm:w-80 text-[11px] text-gray-300 font-sans px-1">
            <span className="font-bengali text-gray-300">ওয়েবসাইট প্রস্তুত হচ্ছে...</span>
            <span className="font-mono font-bold text-yellow-300">{progress}%</span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleDismiss();
            }}
            className="mt-3 text-xs text-gray-300/80 hover:text-white transition-colors underline decoration-dotted underline-offset-4 cursor-pointer font-bengali"
          >
            সরাসরি প্রবেশ করতে এখানে ক্লিক করুন →
          </button>
        </div>
      </div>
    </div>
  );
}
