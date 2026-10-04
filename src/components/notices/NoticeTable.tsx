"use client";
import { useState, useEffect, useRef } from "react";
import { FaFilePdf, FaDownload, FaEye, FaTimes, FaSearch, FaFileAlt, FaBell, FaExpand, FaCompress } from "react-icons/fa";
import { safeDownloadFile } from "@/lib/downloadFile";
import { useLanguage } from "@/lib/LanguageContext";

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
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [pdfFullscreen, setPdfFullscreen] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const blobUrlRef = useRef<string | null>(null);
  const { t } = useLanguage();

  // Create a blob URL for base64 PDFs so <iframe> can render them safely.
  // For regular HTTPS/path URLs, use them directly.
  useEffect(() => {
    // Cleanup previous blob URL
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
    setPdfBlobUrl(null);
    setPdfLoading(false);

    if (!previewNotice?.fileUrl) return;
    const url = previewNotice.fileUrl;

    if (url.startsWith("data:application/pdf")) {
      // Convert base64 data URL → Blob URL
      setPdfLoading(true);
      try {
        const parts = url.split(",");
        const byteCharacters = atob(parts[1]);
        const byteNumbers = new Uint8Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const blob = new Blob([byteNumbers], { type: "application/pdf" });
        const blobUrl = URL.createObjectURL(blob);
        blobUrlRef.current = blobUrl;
        setPdfBlobUrl(blobUrl);
      } catch (e) {
        console.error("PDF blob URL creation failed:", e);
      } finally {
        setPdfLoading(false);
      }
    } else if (isPdfFile(url)) {
      // Regular URL — iframe can use it directly
      setPdfBlobUrl(url);
    }

    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previewNotice]);

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

  const closeModal = () => {
    setPreviewNotice(null);
    setPdfFullscreen(false);
  };

  return (
    <div>
      {/* Page Banner */}
      <div className="bg-[#051939] text-white py-8 mb-8">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <FaBell className="text-yellow-300" />
            <span>{t("নোটিশ বোর্ড", "Notice Board")}</span>
          </h1>
          <p className="text-gray-300 text-sm mt-1">
            {t("প্রচ্ছদ › নোটিশ বোর্ড", "Home › Notice Board")}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-12 max-w-5xl">
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
          {/* Search & Filter Bar */}
          <div className="p-4 bg-gray-50 border-b border-gray-200 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder={t("নোটিশ খুঁজুন...", "Search notices...")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#051939]"
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
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#051939]"
              >
                <option value="all">{t("সকল ক্যাটাগরি", "All Categories")}</option>
                <option value="general">{t("সাধারণ (General)", "General")}</option>
                <option value="exam">{t("পরীক্ষা (Exam)", "Exam")}</option>
                <option value="admission">{t("ভর্তি (Admission)", "Admission")}</option>
                <option value="urgent">{t("জরুরী (Urgent)", "Urgent")}</option>
              </select>

              <span className="text-xs text-gray-500 hidden sm:inline-block">
                {t(`মোট: ${filtered.length}টি`, `Total: ${filtered.length}`)}
              </span>
            </div>
          </div>

          {/* Notice Table */}
          <div className="overflow-x-auto">
            {filtered.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                {t("কোনো নোটিশ পাওয়া যায়নি।", "No notices found.")}
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#051939] text-white">
                    <th className="px-4 py-3 text-left w-14">{t("ক্রমিক", "SL")}</th>
                    <th className="px-4 py-3 text-left w-32">{t("তারিখ", "Date")}</th>
                    <th className="px-4 py-3 text-left">{t("নোটিশের বিবরণ", "Notice Title")}</th>
                    <th className="px-4 py-3 text-center w-36">{t("ফাইল ও অ্যাকশন", "File & Action")}</th>
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
                              {t("নতুন", "NEW")}
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
                              className="inline-flex items-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-700 px-2.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer"
                              title={t("নোটিশ দেখুন", "View Notice")}
                            >
                              <FaEye size={13} />
                              <span className="hidden sm:inline">{t("দেখুন", "View")}</span>
                            </button>

                            <button
                              onClick={(e) => handleDownload(e, notice)}
                              className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1.5 rounded-lg text-xs font-medium shadow-sm transition cursor-pointer"
                              title={t("ফাইল ডাউনলোড করুন", "Download File")}
                            >
                              <FaDownload size={12} />
                              <span>{t("ডাউনলোড", "Download")}</span>
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
        </div>
      </div>

      {/* ─── Preview Modal ─── */}
      {previewNotice && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6"
          onClick={closeModal}
        >
          <div
            className={`bg-white rounded-2xl shadow-2xl w-full flex flex-col overflow-hidden ${
              isPdfFile(previewNotice.fileUrl)
                ? "max-w-5xl max-h-[95vh]"
                : "max-w-3xl max-h-[90vh]"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-[#051939] text-white px-5 py-4 flex items-center justify-between shrink-0">
              <div className="pr-4 min-w-0">
                <span className="text-[11px] text-emerald-400 font-bold uppercase tracking-wider block">
                  {previewNotice.date}
                </span>
                <h3 className="text-base sm:text-lg font-bold leading-snug line-clamp-2">
                  {previewNotice.title}
                </h3>
              </div>
              <button
                onClick={closeModal}
                className="text-gray-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition shrink-0"
              >
                <FaTimes size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="overflow-hidden flex-1 flex flex-col bg-gray-50 min-h-0">

              {/* ── Image ── */}
              {previewNotice.fileUrl && isImageFile(previewNotice.fileUrl) ? (
                <div className="p-4 sm:p-6 flex items-center justify-center flex-1 overflow-y-auto">
                  <div className="max-w-full rounded-xl overflow-hidden shadow border border-gray-200 bg-white">
                    <img
                      src={previewNotice.fileUrl}
                      alt={previewNotice.title}
                      className="max-h-[65vh] object-contain mx-auto"
                    />
                  </div>
                </div>

              /* ── PDF ── */
              ) : previewNotice.fileUrl && isPdfFile(previewNotice.fileUrl) ? (
                <div className="flex flex-col flex-1 min-h-0">

                  {/* PDF mini-toolbar */}
                  <div className="flex items-center justify-between px-4 py-2 bg-red-50 border-b border-red-100 shrink-0">
                    <div className="flex items-center gap-2">
                      <FaFilePdf className="text-red-500" size={15} />
                      <span className="text-xs font-bold text-red-700">
                        {t("পিডিএফ ভিউয়ার", "PDF Viewer")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPdfFullscreen((v) => !v)}
                        className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-900 text-xs px-2 py-1 rounded hover:bg-gray-200 transition"
                        title={pdfFullscreen ? t("ছোট করুন", "Exit Fullscreen") : t("ফুলস্ক্রিন", "Fullscreen")}
                      >
                        {pdfFullscreen ? <FaCompress size={12} /> : <FaExpand size={12} />}
                        <span className="hidden sm:inline">
                          {pdfFullscreen ? t("ছোট করুন", "Exit Fullscreen") : t("ফুলস্ক্রিন", "Fullscreen")}
                        </span>
                      </button>
                      <button
                        onClick={(e) => handleDownload(e, previewNotice)}
                        className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3 py-1.5 rounded-lg font-medium shadow-sm transition"
                      >
                        <FaDownload size={11} />
                        <span>{t("ডাউনলোড", "Download")}</span>
                      </button>
                    </div>
                  </div>

                  {/* Fullscreen overlay */}
                  {pdfFullscreen && pdfBlobUrl && (
                    <div className="fixed inset-0 z-[60] flex flex-col bg-gray-900" onClick={(e) => e.stopPropagation()}>
                      <div className="bg-[#051939] text-white px-4 py-2.5 flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-2 min-w-0">
                          <FaFilePdf className="text-red-400 shrink-0" size={14} />
                          <span className="text-sm font-bold line-clamp-1">{previewNotice.title}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={(e) => handleDownload(e, previewNotice)}
                            className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3 py-1.5 rounded-lg font-medium transition"
                          >
                            <FaDownload size={11} />
                            {t("ডাউনলোড", "Download")}
                          </button>
                          <button
                            onClick={() => setPdfFullscreen(false)}
                            className="text-gray-300 hover:text-white p-1.5 rounded hover:bg-white/10 transition"
                          >
                            <FaCompress size={16} />
                          </button>
                        </div>
                      </div>
                      <iframe
                        src={`${pdfBlobUrl}#toolbar=1&navpanes=1&scrollbar=1&view=FitH`}
                        className="flex-1 w-full border-0"
                        title={previewNotice.title}
                      />
                    </div>
                  )}

                  {/* Inline PDF iframe */}
                  {pdfLoading ? (
                    <div className="flex-1 flex items-center justify-center gap-3 py-16 text-gray-500 text-sm">
                      <svg className="animate-spin h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      {t("পিডিএফ লোড হচ্ছে...", "Loading PDF...")}
                    </div>
                  ) : pdfBlobUrl ? (
                    <iframe
                      src={`${pdfBlobUrl}#toolbar=1&navpanes=1&scrollbar=1&view=FitH`}
                      className="flex-1 w-full border-0"
                      style={{ minHeight: "65vh" }}
                      title={previewNotice.title}
                    />
                  ) : (
                    /* Fallback if blob creation failed */
                    <div className="flex-1 flex flex-col items-center justify-center py-12 px-6 text-center">
                      <FaFilePdf size={56} className="text-red-400 mb-4" />
                      <p className="font-bold text-gray-700 mb-2">
                        {t("পিডিএফ লোড করা যায়নি", "PDF could not be loaded")}
                      </p>
                      <p className="text-xs text-gray-500 mb-5">
                        {t("ব্রাউজার সরাসরি দেখাতে পারছে না, ডাউনলোড করে দেখুন।", "Your browser cannot display it inline. Please download.")}
                      </p>
                      <button
                        onClick={(e) => handleDownload(e, previewNotice)}
                        className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-6 rounded-xl text-sm shadow transition"
                      >
                        <FaDownload size={14} />
                        {t("পিডিএফ ডাউনলোড করুন", "Download PDF")}
                      </button>
                    </div>
                  )}
                </div>

              /* ── Other file types ── */
              ) : (
                <div className="p-8 text-center text-gray-600 flex flex-col items-center flex-1 justify-center">
                  <FaFileAlt size={48} className="mx-auto text-blue-500 mb-3" />
                  <p className="font-medium text-sm">
                    {t("সংযুক্ত ফাইলটি ডাউনলোড করে দেখতে পারেন", "You can download the attached file to view")}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-white border-t border-gray-100 flex items-center justify-between shrink-0">
              <span className="text-xs text-gray-500 hidden sm:block">
                {t("বানিয়াচং আদর্শ উচ্চ বিদ্যালয় নোটিশ বোর্ড", "Baniyachong Adarsha High School Notice Board")}
              </span>
              <div className="flex items-center gap-2 ml-auto">
                {previewNotice.fileUrl && (
                  <button
                    onClick={(e) => handleDownload(e, previewNotice)}
                    className="inline-flex items-center gap-2 bg-[#06874A] hover:bg-green-700 text-white font-bold py-2 px-4 rounded-xl text-xs shadow transition"
                  >
                    <FaDownload size={12} />
                    <span>{t("ফাইল ডাউনলোড করুন", "Download File")}</span>
                  </button>
                )}
                <button
                  onClick={closeModal}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-xl text-xs transition"
                >
                  {t("বন্ধ করুন", "Close")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
