"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { FaFilePdf, FaBell, FaArrowRight, FaDownload } from "react-icons/fa";
import { useLanguage } from "@/lib/LanguageContext";
import { safeDownloadFile } from "@/lib/downloadFile";

export default function NoticeBoard() {
  const { t } = useLanguage();
  const [noticeList, setNoticeList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Quick cache check to avoid layout shift
    try {
      const cached = localStorage.getItem("bahs_cached_notices");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setNoticeList(parsed);
          setLoading(false);
        }
      }
    } catch (e) {}

    fetch("/api/notices")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setNoticeList(data);
          try {
            localStorage.setItem("bahs_cached_notices", JSON.stringify(data));
          } catch (e) {}
        }
      })
      .catch((e) => console.error("NoticeBoard fetch error:", e))
      .finally(() => setLoading(false));
  }, []);

  const handleDownload = (e: React.MouseEvent, notice: any) => {
    e.preventDefault();
    e.stopPropagation();
    if (!notice.fileUrl) return;
    safeDownloadFile(notice.fileUrl, notice.title);
  };

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
          {noticeList.length} {t("টি নোটিশ", "Notices")}
        </span>
      </div>

      {/* Notice List */}
      <div className="divide-y divide-gray-100">
        {loading && noticeList.length === 0 ? (
          <div className="p-6 text-center text-xs text-gray-400">নোটিশ লোড হচ্ছে...</div>
        ) : noticeList.length === 0 ? (
          <div className="p-6 text-center text-xs text-gray-400">বর্তমানে কোনো নোটিশ নেই।</div>
        ) : (
          noticeList.slice(0, 4).map((notice) => {
            const dateParts = notice.date ? notice.date.split(" ") : ["", ""];
            const day = dateParts[0] || "";
            const monthYear = dateParts.slice(1).join(" ") || "";

            return (
              <div key={notice.id} className="p-3.5 hover:bg-blue-50/40 transition-colors flex items-start gap-3 group">
                <div className="text-center shrink-0 bg-[#051939] group-hover:bg-[#06874A] text-white rounded-lg p-1.5 min-w-[50px] transition-colors shadow-sm">
                  <div className="text-base font-bold leading-none">{day}</div>
                  <div className="text-[10px] mt-0.5 text-gray-200">{monthYear}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs md:text-sm text-gray-800 leading-snug flex items-start justify-between gap-2">
                    <div className="flex items-start gap-1.5 flex-1 min-w-0">
                      {notice.isNew && (
                        <span className="inline-block bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded font-bold shrink-0 mt-0.5">
                          {t("নতুন", "New")}
                        </span>
                      )}
                      <Link
                        href="/notices"
                        className="font-medium group-hover:text-[#06874A] transition-colors hover:underline"
                      >
                        {notice.title}
                      </Link>
                    </div>

                    {notice.fileUrl && (
                      <button
                        type="button"
                        onClick={(e) => handleDownload(e, notice)}
                        className="text-red-500 hover:text-emerald-700 bg-red-50 hover:bg-emerald-50 p-1.5 rounded-md shrink-0 transition flex items-center gap-1 text-xs cursor-pointer"
                        title="ফাইল ডাউনলোড করুন"
                      >
                        <FaDownload size={11} />
                        <span className="hidden sm:inline text-[10px] font-bold">ফাইল</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
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
