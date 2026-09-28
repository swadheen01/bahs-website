"use client";
import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/LanguageContext";

export default function MarqueeNotice() {
  const { t } = useLanguage();
  const [notices, setNotices] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/notices", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setNotices(data);
        }
      })
      .catch((e) => console.error("Marquee fetch error:", e));
  }, []);

  const latestNotices =
    notices.length > 0
      ? notices.slice(0, 5).map((n) => n.title).join("  ➤  ")
      : t("বানিয়াচং আদর্শ উচ্চ বিদ্যালয়ের ওয়েবসাইটে আপনাকে স্বাগতম", "Welcome to Baniyachong Adarsha High School Official Website");

  return (
    <div className="bg-[#800505] text-white flex items-stretch overflow-hidden">
      {/* Label */}
      <div className="bg-[#051939] px-4 py-2.5 flex items-center gap-2 shrink-0 z-10">
        <span className="animate-pulse w-2 h-2 rounded-full bg-yellow-300 inline-block" />
        <span className="text-sm font-bold whitespace-nowrap">
          {t("গুরুত্বপূর্ণ নোটিশ", "Latest Notices")}
        </span>
      </div>

      {/* Scrolling text */}
      <div className="overflow-hidden flex-1 py-2.5 relative">
        <div className="flex animate-marquee whitespace-nowrap">
          <span className="text-sm px-8">{latestNotices}</span>
          <span className="text-sm px-8">{latestNotices}</span>
        </div>
      </div>
    </div>
  );
}
