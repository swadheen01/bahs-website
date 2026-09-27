"use client";
import Link from "next/link";
import notices from "@/data/notices.json";
import { FaFilePdf, FaBell, FaArrowRight } from "react-icons/fa";
import { useLanguage } from "@/lib/LanguageContext";

export default function NoticeBoard() {
  const { t } = useLanguage();

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden glossy-shine transition-all duration-300 hover:shadow-xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#051939] to-[#0d2a5d] text-white px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="p-1.5 bg-yellow-400/20 rounded-lg text-yellow-300">
            <FaBell size={16} />
          </span>
          <h2 className="font-bold text-base md:text-lg">
            {t("নোটিশ বোর্ড", "Notice Board")}
          </h2>
        </div>
        <span className="text-[11px] bg-white/10 px-2.5 py-0.5 rounded-full border border-white/15 text-gray-200">
          {notices.length} {t("টি নোটিশ", "Notices")}
        </span>
      </div>

      {/* Notice List */}
      <div className="divide-y divide-gray-100">
        {notices.slice(0, 4).map((notice) => (
          <div key={notice.id} className="p-3.5 hover:bg-blue-50/40 transition-colors flex items-start gap-3 group">
            <div className="text-center shrink-0 bg-[#051939] group-hover:bg-[#06874A] text-white rounded-lg p-1.5 min-w-[50px] transition-colors shadow-sm">
              <div className="text-base font-bold leading-none">
                {notice.date.split(" ")[0]}
              </div>
              <div className="text-[10px] mt-0.5 text-gray-200">{notice.date.split(" ").slice(1).join(" ")}</div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs md:text-sm text-gray-800 leading-snug flex items-start gap-1.5">
                {notice.isNew && (
                  <span className="inline-block bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded font-bold shrink-0 mt-0.5">
                    {t("নতুন", "New")}
                  </span>
                )}
                {notice.fileUrl ? (
                  <a
                    href={notice.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#051939] group-hover:text-[#06874A] hover:underline flex items-center gap-1 font-medium transition-colors"
                  >
                    <span>{notice.title}</span>
                    <FaFilePdf className="text-red-500 shrink-0 text-sm" />
                  </a>
                ) : (
                  <span className="font-medium group-hover:text-[#06874A] transition-colors">{notice.title}</span>
                )}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Link */}
      <div className="px-5 py-3 bg-gray-50/80 border-t border-gray-100 flex justify-between items-center">
        <Link
          href="/notices"
          className="text-xs md:text-sm text-[#051939] font-bold hover:text-[#06874A] flex items-center gap-1.5 group transition-colors"
        >
          <span>{t("সকল নোটিশ দেখুন", "View All Notices")}</span>
          <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
