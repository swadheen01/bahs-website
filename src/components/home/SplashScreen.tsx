"use client";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function SplashScreen() {
  const [show, setShow] = useState<boolean>(true);
  const [fadeOut, setFadeOut] = useState<boolean>(false);

  const handleDismiss = () => {
    setFadeOut(true);
    try {
      sessionStorage.setItem("bahs_splash_v2", "true");
      document.documentElement.classList.add("splash-hidden");
    } catch (e) {}

    setTimeout(() => {
      setShow(false);
    }, 400);
  };

  useEffect(() => {
    try {
      if (sessionStorage.getItem("bahs_splash_v2") === "true") {
        setShow(false);
        return;
      }
    } catch (e) {}

    // Failsafe auto-dismiss from React in case inline script was interrupted
    const timeout = setTimeout(() => {
      handleDismiss();
    }, 1800);

    return () => clearTimeout(timeout);
  }, []);

  if (!show) return null;

  return (
    <div
      id="bahs-splash-screen"
      onClick={handleDismiss}
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-br from-[#051939] via-[#092b5e] to-[#030e20] text-white select-none cursor-pointer transition-all duration-400 ${
        fadeOut ? "opacity-0 scale-105 pointer-events-none" : "opacity-100 scale-100"
      }`}
    >
      {/* Background ambient decorative glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-blue-500/15 blur-3xl pointer-events-none animate-pulse" />

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
                priority
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
          {/* Progress bar container */}
          <div className="w-64 sm:w-80 h-2.5 bg-white/20 rounded-full overflow-hidden p-0.5 border border-white/25 backdrop-blur-md shadow-inner">
            <div
              id="bahs-splash-bar"
              className="h-full bg-gradient-to-r from-emerald-400 via-teal-300 to-yellow-300 rounded-full shadow-[0_0_12px_rgba(52,211,153,0.8)]"
              style={{ width: "0%" }}
            />
          </div>

          {/* Status info & Percentage */}
          <div className="flex items-center justify-between w-64 sm:w-80 text-[11px] text-gray-300 font-sans px-1">
            <span className="font-bengali text-gray-300">ওয়েবসাইট প্রস্তুত হচ্ছে...</span>
            <span id="bahs-splash-pct" className="font-mono font-bold text-yellow-300">0%</span>
          </div>

          <button
            type="button"
            id="bahs-splash-skip-btn"
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

      {/* Immediate Native Script for Instant Animation and Guaranteed Dismissal (zero hydration delay) */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function(){
              try {
                if (sessionStorage.getItem('bahs_splash_v2') === 'true') {
                  var splash = document.getElementById('bahs-splash-screen');
                  if (splash) splash.style.display = 'none';
                  return;
                }
              } catch(e){}

              function dismiss() {
                var el = document.getElementById('bahs-splash-screen');
                if (!el || el.dataset.dismissed) return;
                el.dataset.dismissed = 'true';
                el.style.transition = 'all 0.4s ease';
                el.style.opacity = '0';
                el.style.transform = 'scale(1.05)';
                el.style.pointerEvents = 'none';
                try {
                  sessionStorage.setItem('bahs_splash_v2', 'true');
                  document.documentElement.classList.add('splash-hidden');
                } catch(e){}
                setTimeout(function(){
                  if (el) el.style.display = 'none';
                }, 400);
              }

              // Bind immediate native clicks even before React hydrates
              var el = document.getElementById('bahs-splash-screen');
              if (el) {
                el.addEventListener('click', dismiss);
              }
              var btn = document.getElementById('bahs-splash-skip-btn');
              if (btn) {
                btn.addEventListener('click', function(e){
                  e.stopPropagation();
                  dismiss();
                });
              }

              // Ultra-smooth native progress animation (~1.3s)
              var bar = document.getElementById('bahs-splash-bar');
              var pct = document.getElementById('bahs-splash-pct');
              var start = Date.now();
              var duration = 1300;

              function tick() {
                var elapsed = Date.now() - start;
                var progress = Math.min(100, Math.round((elapsed / duration) * 100));
                if (bar) bar.style.width = progress + '%';
                if (pct) pct.textContent = progress + '%';
                if (progress < 100) {
                  requestAnimationFrame(tick);
                } else {
                  setTimeout(dismiss, 120);
                }
              }

              requestAnimationFrame(tick);

              // Absolute failsafe maximum timer
              setTimeout(dismiss, 2200);
            })();
          `,
        }}
      />
    </div>
  );
}
