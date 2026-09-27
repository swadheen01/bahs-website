"use client";
import { useLanguage } from "@/lib/LanguageContext";

export default function LanguageToggle({ size = "sm" }: { size?: "sm" | "md" }) {
  const { language, setLang } = useLanguage();

  const isSmall = size === "sm";

  return (
    <div className={`inline-flex items-center bg-black/35 backdrop-blur-md rounded-lg border border-white/20 shadow-inner ${isSmall ? "p-0.5" : "p-1"}`}>
      <button 
        type="button"
        onClick={() => setLang("bn")}
        className={`${isSmall ? "px-2 py-0.5 text-[11px]" : "px-3 py-1 text-xs"} rounded-md font-bengali transition-all duration-200 ${
          language === "bn"
            ? "bg-[#06874A] text-white font-bold shadow-sm glossy-btn border border-white/30"
            : "text-gray-300 hover:text-white"
        }`}
      >
        বাংলা
      </button>
      <button 
        type="button"
        onClick={() => setLang("en")}
        className={`${isSmall ? "px-2 py-0.5 text-[11px]" : "px-3 py-1 text-xs"} rounded-md font-sans transition-all duration-200 ${
          language === "en"
            ? "bg-[#06874A] text-white font-bold shadow-sm border border-white/30"
            : "text-gray-300 hover:text-white"
        }`}
      >
        EN
      </button>
    </div>
  );
}
