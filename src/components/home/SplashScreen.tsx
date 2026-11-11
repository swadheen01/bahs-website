"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";

const FILL_DURATION_MS = 1400;
const COMPLETE_HOLD_MS = 250;
const EXIT_DURATION_MS = 350;

export default function SplashScreen() {
  const [show, setShow] = useState<boolean>(true);
  const [fadeOut, setFadeOut] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);

  const dismissedRef = useRef<boolean>(false);
  const rafRef = useRef<number | null>(null);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const failsafeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearAllTimers = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (holdTimerRef.current !== null) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (hideTimerRef.current !== null) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
    if (failsafeTimerRef.current !== null) {
      clearTimeout(failsafeTimerRef.current);
      failsafeTimerRef.current = null;
    }
  }, []);

  const handleDismiss = useCallback(() => {
    if (dismissedRef.current) return;
    dismissedRef.current = true;
    clearAllTimers();
    setFadeOut(true);

    try {
      sessionStorage.setItem("bahs_splash_v2", "true");
    } catch {}

    hideTimerRef.current = setTimeout(() => {
      try {
        document.documentElement.classList.add("splash-hidden");
      } catch {}
      setShow(false);
    }, EXIT_DURATION_MS);
  }, [clearAllTimers]);

  useEffect(() => {
    try {
      if (sessionStorage.getItem("bahs_splash_v2") === "true") {
        setShow(false);
        return;
      }
    } catch {}

    dismissedRef.current = false;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleDismiss();
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      setProgress(100);
      holdTimerRef.current = setTimeout(() => {
        handleDismiss();
      }, 1600);
    } else {
      let startTime: number | null = null;

      const tick = (now: number) => {
        if (dismissedRef.current) return;
        if (startTime === null) {
          startTime = now;
        }

        const elapsed = now - startTime;
        const linearRatio = Math.min(1, elapsed / FILL_DURATION_MS);
        const easedRatio = 1 - Math.pow(1 - linearRatio, 2);
        const blendedRatio = 0.8 * linearRatio + 0.2 * easedRatio;
        const nextProgress = Math.min(100, Math.round(blendedRatio * 100));

        setProgress(nextProgress);

        if (linearRatio < 1) {
          rafRef.current = requestAnimationFrame(tick);
        } else {
          setProgress(100);
          holdTimerRef.current = setTimeout(() => {
            handleDismiss();
          }, COMPLETE_HOLD_MS);
        }
      };

      rafRef.current = requestAnimationFrame(tick);

      // Generous fallback only if requestAnimationFrame is suspended for an extended period
      failsafeTimerRef.current = setTimeout(() => {
        setProgress(100);
        holdTimerRef.current = setTimeout(() => {
          handleDismiss();
        }, COMPLETE_HOLD_MS);
      }, 4000);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      clearAllTimers();
    };
  }, [handleDismiss, clearAllTimers]);

  if (!show) return null;

  return (
    <div
      id="bahs-splash-screen"
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-br from-[#051939] via-[#092b5e] to-[#030e20] text-white select-none transition-[opacity,transform] duration-[350ms] ease-out ${
        fadeOut
          ? "opacity-0 motion-safe:scale-105 pointer-events-none"
          : "opacity-100 scale-100"
      }`}
    >
      {/* Background ambient decorative glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none motion-safe:animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-blue-500/15 blur-3xl pointer-events-none motion-safe:animate-pulse" />

      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-lg">
        {/* Animated Central Logo */}
        <div className="relative mb-6">
          <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-yellow-400 opacity-40 blur-xl animate-spin-slow" />
          <div className="relative w-36 h-36 sm:w-44 sm:h-44 bg-white rounded-full p-1 sm:p-1.5 shadow-2xl border-4 border-white/90 flex items-center justify-center transform transition-transform hover:scale-105">
            <div className="relative w-full h-full">
              <Image
                src="/images/logo/logo.png"
                alt="BAHS Logo"
                fill
                preload
                className="object-contain"
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

        {/* Progress bar loader & Quick Enter prompt */}
        <div className="mt-8 flex flex-col items-center gap-2.5 w-full">
          <div className="w-64 sm:w-80 p-0.5 rounded-full border border-white/25 backdrop-blur-md shadow-inner bg-white/10 flex items-center">
            <progress
              id="bahs-splash-bar"
              aria-label="ওয়েবসাইট লোডিং অগ্রগতি"
              max={100}
              value={progress}
              className="bahs-splash-progress w-full h-2 block"
            />
          </div>

          {/* Status info & Percentage */}
          <div className="flex items-center justify-between w-64 sm:w-80 text-[11px] text-gray-300 font-sans px-1">
            <span role="status" aria-live="polite" className="font-bengali text-gray-300">
              {progress >= 100 ? "স্বাগতম! ওয়েবসাইট প্রস্তুত..." : "ওয়েবসাইট প্রস্তুত হচ্ছে..."}
            </span>
            <span id="bahs-splash-pct" className="font-mono font-bold text-yellow-300">
              {progress}%
            </span>
          </div>

          <button
            type="button"
            id="bahs-splash-skip-btn"
            onClick={handleDismiss}
            className="mt-3 text-xs text-gray-300/90 hover:text-white transition-colors underline decoration-dotted underline-offset-4 cursor-pointer font-bengali"
          >
            সরাসরি প্রবেশ করতে এখানে ক্লিক করুন →
          </button>
        </div>
      </div>
    </div>
  );
}
