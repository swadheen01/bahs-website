"use client";
import notices from "@/data/notices.json";
import { useLanguage } from "@/lib/LanguageContext";

export default function MarqueeNotice() {
  const { t } = useLanguage();
  const latestNotices = notices.slice(0, 5).map((n) => n.title).join("  ➤  ");

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
