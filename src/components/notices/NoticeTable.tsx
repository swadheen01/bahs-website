"use client";
import { useState } from "react";
import { FaFilePdf, FaDownload, FaEye, FaTimes, FaSearch, FaFileAlt } from "react-icons/fa";
import { safeDownloadFile } from "@/lib/downloadFile";

interface Notice {
  id: number;
  title: string;
  date: string;
  dateISO?: string;
  type?: string;
  fileUrl: string | null;
  isNew?: boolean;
}

interface NoticeTableProps {
  notices: Notice[];
}

export default function NoticeTable({ notices }: NoticeTableProps) {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [previewNotice, setPreviewNotice] = useState<Notice | null>(null);

  const filtered = notices.filter((n) => {
    const matchesSearch = !search || n.title.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === "all" || n.type === filterType;
    return matchesSearch && matchesType;
  });

  const isImageFile = (url: string | null) => {
    if (!url) return false;
    return (
      url.startsWith("data:image/") ||
      /\.(jpg|jpeg|png|webp|gif)($|\?)/i.test(url) ||
      url.includes("/uploads/")
    );
  };

  const isPdfFile = (url: string | null) => {
    if (!url) return false;
    return url.startsWith("data:application/pdf") || /\.pdf($|\?)/i.test(url);
  };

  const handleDownload = (e: React.MouseEvent, notice: Notice) => {
    e.stopPropagation();
    if (!notice.fileUrl) return;
    safeDownloadFile(notice.fileUrl, `${notice.title.replace(/[^a-zA-Z0-9\u0980-\u09FF_-]/g, "_")}`);
  };

  return (
    <div>
      {/* Search & Filter Bar */}
      <div className="p-4 bg-gray-50 border-b border-gray-200 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="নোটিশ খুঁজুন..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm font-bengali focus:outline-none focus:ring-2 focus:ring-[#051939]"
          />
          <FaSearch className="absolute left-3 top-3 text-gray-400 text-xs" />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
            >
              <FaTimes size={12} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm font-bengali bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#051939]"
          >
            <option value="all">সকল ক্যাটাগরি</option>
            <option value="general">সাধারণ (General)</option>
            <option value="exam">পরীক্ষা (Exam)</option>
            <option value="admission">ভর্তি (Admission)</option>
            <option value="urgent">জরুরী (Urgent)</option>
          </select>

          <span className="text-xs text-gray-500 font-bengali hidden sm:inline-block">
            মোট: <strong>{filtered.length}টি</strong>
          </span>
        </div>
      </div>

      {/* Notice Table */}
      <div className="overflow-x-auto">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-500 font-bengali">
            কোনো নোটিশ পাওয়া যায়নি।
          </div>
        ) : (
          <table className="w-full text-sm font-bengali">
            <thead>
              <tr className="bg-[#051939] text-white">
                <th className="px-4 py-3 text-left w-14">ক্রমিক</th>
                <th className="px-4 py-3 text-left w-32">তারিখ</th>
                <th className="px-4 py-3 text-left">নোটিশের বিবরণ</th>
                <th className="px-4 py-3 text-center w-36">ফাইল ও অ্যাকশন</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((notice, i) => (
                <tr
                  key={notice.id}
                  onClick={() => notice.fileUrl && setPreviewNotice(notice)}
                  className={`border-b border-gray-100 hover:bg-blue-50/50 transition-colors ${
                    i % 2 === 0 ? "bg-white" : "bg-gray-50/40"
                  } ${notice.fileUrl ? "cursor-pointer" : ""}`}
                >
                  <td className="px-4 py-3 text-gray-500 font-semibold">{i + 1}</td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap text-xs">{notice.date}</td>
                  <td className="px-4 py-3 text-[#051939]">
                    <div className="flex items-center gap-2">
                      {notice.isNew && (
                        <span className="inline-block bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded font-bold shrink-0 animate-pulse">
                          নতুন
                        </span>
                      )}
                      <span className="font-medium hover:text-[#06874A] transition-colors">
                        {notice.title}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                    {notice.fileUrl ? (
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setPreviewNotice(notice)}
                          className="inline-flex items-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-700 px-2.5 py-1.5 rounded-lg text-xs font-medium transition"
                          title="নোটিশ দেখুন"
                        >
                          <FaEye size={13} />
                          <span className="hidden sm:inline">দেখুন</span>
                        </button>

                        <button
                          onClick={(e) => handleDownload(e, notice)}
                          className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1.5 rounded-lg text-xs font-medium shadow-sm transition"
                          title="ফাইল ডাউনলোড করুন"
                        >
                          <FaDownload size={12} />
                          <span>ডাউনলোড</span>
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-300 text-xs">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Preview Modal (Safe Viewer) */}
      {previewNotice && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fade-in"
          onClick={() => setPreviewNotice(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden font-bengali"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-[#051939] text-white px-5 py-4 flex items-center justify-between">
              <div className="pr-4">
                <span className="text-[11px] text-emerald-400 font-bold uppercase tracking-wider block">
                  {previewNotice.date}
                </span>
                <h3 className="text-base sm:text-lg font-bold leading-snug line-clamp-2">
                  {previewNotice.title}
                </h3>
              </div>
              <button
                onClick={() => setPreviewNotice(null)}
                className="text-gray-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
              >
                <FaTimes size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 flex flex-col items-center justify-center bg-gray-50">
              {previewNotice.fileUrl && isImageFile(previewNotice.fileUrl) ? (
                <div className="max-w-full rounded-xl overflow-hidden shadow border border-gray-200 bg-white">
                  <img
                    src={previewNotice.fileUrl}
                    alt={previewNotice.title}
                    className="max-h-[60vh] object-contain mx-auto"
                  />
                </div>
              ) : previewNotice.fileUrl && isPdfFile(previewNotice.fileUrl) ? (
                <div className="w-full h-[60vh] rounded-xl overflow-hidden shadow border border-gray-200 bg-white flex flex-col items-center justify-center p-6 text-center">
                  <FaFilePdf size={64} className="text-red-500 mb-4" />
                  <p className="font-bold text-gray-800 text-lg mb-2">পিডিএফ ডকুমেন্ট ফাইল</p>
                  <p className="text-xs text-gray-500 mb-6 max-w-md">
                    সম্পূর্ণ নোটিশটি পড়তে নিচের বাটনে ক্লিক করে ফাইলটি সরাসরি ডাউনলোড বা ওপেন করুন।
                  </p>
                  <button
                    onClick={(e) => handleDownload(e, previewNotice)}
                    className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-6 rounded-xl text-sm shadow transition"
                  >
                    <FaDownload size={14} />
                    <span>পিডিএফ ডাউনলোড করুন</span>
                  </button>
                </div>
              ) : (
                <div className="p-8 text-center text-gray-600">
                  <FaFileAlt size={48} className="mx-auto text-blue-500 mb-3" />
                  <p className="font-medium text-sm">সংযুক্ত ফাইলটি ডাউনলোড করে দেখতে পারেন</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-white border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-500">
                বানিয়াচং আদর্শ উচ্চ বিদ্যালয় নোটিশ বোর্ড
              </span>
              <div className="flex items-center gap-2">
                {previewNotice.fileUrl && (
                  <button
                    onClick={(e) => handleDownload(e, previewNotice)}
                    className="inline-flex items-center gap-2 bg-[#06874A] hover:bg-green-700 text-white font-bold py-2 px-4 rounded-xl text-xs shadow transition cursor-pointer"
                  >
                    <FaDownload size={12} />
                    <span>ফাইল ডাউনলোড করুন</span>
                  </button>
                )}
                <button
                  onClick={() => setPreviewNotice(null)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-xl text-xs transition"
                >
                  বন্ধ করুন
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
