"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useLanguage } from "@/lib/LanguageContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FaArrowLeft,
  FaPlus,
  FaFilePdf,
  FaTrash,
  FaSave,
  FaCheckCircle,
  FaCalendarAlt,
  FaUpload,
  FaSearch,
  FaEdit,
  FaTimes,
} from "react-icons/fa";

export default function AdminHolidaysPage() {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  const [holidaysData, setHolidaysData] = useState<any>({
    academicYear: "2025",
    calendarPdfUrl: "",
    calendarPdfTitle: "",
    holidays: [],
  });
  const [fetching, setFetching] = useState(true);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [savingHoliday, setSavingHoliday] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // New Holiday Form
  const [editHolidayId, setEditHolidayId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newStartDate, setNewStartDate] = useState("");
  const [newEndDate, setNewEndDate] = useState("");
  const [newTotalDays, setNewTotalDays] = useState("১ দিন");
  const [newType, setNewType] = useState("সরকারি ছুটি");
  const [newDescription, setNewDescription] = useState("");

  // PDF Calendar Upload
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfTitle, setPdfTitle] = useState("");
  const [academicYear, setAcademicYear] = useState("2025");

  // Search
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  const loadData = async () => {
    setFetching(true);
    try {
      const res = await fetch("/api/holidays");
      const data = await res.json();
      if (data && data.holidays) {
        setHolidaysData(data);
        setPdfTitle(data.calendarPdfTitle || "");
        setAcademicYear(data.academicYear || "2025");
      }
    } catch (err) {
      console.error(err);
    }
    setFetching(false);
  };

  useEffect(() => {
    if (user?.role === "admin") loadData();
  }, [user]);

  // Handle Calendar PDF Upload
  const handleCalendarPdfUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pdfFile && !holidaysData.calendarPdfUrl) {
      alert("অনুগ্রহ করে একটি PDF ফাইল নির্বাচন করুন");
      return;
    }
    setUploadingPdf(true);
    try {
      let fileUrl = holidaysData.calendarPdfUrl;

      if (pdfFile) {
        const formData = new FormData();
        formData.append("file", pdfFile);
        const upRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const upData = await upRes.json();
        if (upRes.ok && upData.url) {
          fileUrl = upData.url;
        } else {
          alert("ফাইল আপলোড ব্যর্থ হয়েছে");
          setUploadingPdf(false);
          return;
        }
      }

      const res = await fetch("/api/holidays", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "uploadCalendar",
          calendarPdfUrl: fileUrl,
          calendarPdfTitle: pdfTitle || "বার্ষিক ছুটির তালিকা ও শিক্ষাপঞ্জি",
          academicYear,
        }),
      });

      if (res.ok) {
        setSuccessMsg("বার্ষিক শিক্ষাপঞ্জি PDF সফলভাবে সংরক্ষিত হয়েছে!");
        loadData();
        setTimeout(() => setSuccessMsg(""), 3500);
      }
    } catch (err) {
      alert("ত্রুটি দেখা দিয়েছে");
    }
    setUploadingPdf(false);
  };

  // Handle Add or Edit Holiday
  const handleAddHoliday = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newStartDate) {
      alert("ছুটির নাম এবং শুরুর তারিখ আবশ্যক");
      return;
    }
    setSavingHoliday(true);
    try {
      const isEditing = editHolidayId !== null;
      const res = await fetch("/api/holidays", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: isEditing ? "editHoliday" : "addHoliday",
          id: editHolidayId || undefined,
          title: newTitle,
          startDate: newStartDate,
          endDate: newEndDate || newStartDate,
          totalDays: newTotalDays,
          type: newType,
          description: newDescription,
        }),
      });

      if (res.ok) {
        setSuccessMsg(isEditing ? "ছুটি সফলভাবে আপডেট হয়েছে!" : "নতুন ছুটি সফলভাবে তালিকায় যুক্ত হয়েছে!");
        setNewTitle("");
        setNewStartDate("");
        setNewEndDate("");
        setNewDescription("");
        setEditHolidayId(null);
        loadData();
        setTimeout(() => setSuccessMsg(""), 3500);
      } else {
        alert(isEditing ? "ছুটি আপডেট ব্যর্থ হয়েছে" : "ছুটি যোগ ব্যর্থ হয়েছে");
      }
    } catch (err) {
      alert("ত্রুটি হয়েছে");
    }
    setSavingHoliday(false);
  };

  const handleEditHoliday = (h: any) => {
    setEditHolidayId(h.id);
    setNewTitle(h.title || "");
    setNewStartDate(h.startDate || "");
    setNewEndDate(h.endDate || "");
    setNewTotalDays(h.totalDays || "১ দিন");
    setNewType(h.type || "সরকারি ছুটি");
    setNewDescription(h.description || "");
    window.scrollTo({ top: 400, behavior: "smooth" });
  };

  const handleCancelHolidayEdit = () => {
    setEditHolidayId(null);
    setNewTitle("");
    setNewStartDate("");
    setNewEndDate("");
    setNewDescription("");
  };

  // Handle Delete Holiday
  const handleDeleteHoliday = async (id: string, title: string) => {
    if (!confirm(`আপনি কি "${title}" ছুটির তালিকা থেকে মুছে ফেলতে চান?`)) return;
    try {
      const res = await fetch(`/api/holidays?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setHolidaysData((prev: any) => ({
          ...prev,
          holidays: prev.holidays.filter((h: any) => h.id !== id),
        }));
      } else {
        alert("মুছে ফেলা সম্ভব হয়নি");
      }
    } catch (err) {
      alert("ত্রুটি হয়েছে");
    }
  };

  const filtered = (holidaysData.holidays || []).filter((h: any) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return h.title?.toLowerCase().includes(q) || h.type?.toLowerCase().includes(q);
  });

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-gray-100 font-bengali pb-20">
      {/* Header */}
      <header className="bg-[#051939] text-white px-6 py-4 flex items-center justify-between shadow">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/admin" className="text-gray-300 hover:text-white text-sm flex items-center gap-1">
            <FaArrowLeft /> ড্যাশবোর্ড
          </Link>
          <span className="text-gray-600">|</span>
          <h1 className="text-lg font-bold flex items-center gap-2">
            <FaCalendarAlt className="text-yellow-400" />
            বার্ষিক ছুটির তালিকা ও শিক্ষাপঞ্জি ব্যবস্থাপনা
          </h1>
        </div>

        <Link
          href="/academics/holidays"
          target="_blank"
          className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg border border-white/20 transition"
        >
          পাবলিক ছুটির তালিকা দেখুন →
        </Link>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl space-y-6">
        {/* Success Alert */}
        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 flex items-center gap-2 font-bold text-sm shadow-sm animate-in fade-in">
            <FaCheckCircle className="text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Section 1: Academic Calendar PDF Upload Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between border-b pb-3 mb-4">
            <h3 className="text-base font-bold text-[#051939] flex items-center gap-2">
              <FaFilePdf className="text-red-500" />
              বার্ষিক শিক্ষাপঞ্জি ও ছুটির তালিকা PDF আপলোড
            </h3>
            {holidaysData.calendarPdfUrl && (
              <a
                href={holidaysData.calendarPdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-emerald-700 font-bold hover:underline"
              >
                বর্তমান ফাইল দেখুন →
              </a>
            )}
          </div>

          <form onSubmit={handleCalendarPdfUpload} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">শিক্ষাবর্ষ</label>
              <input
                type="text"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                placeholder="2025"
                className="w-full border rounded-xl p-2.5 text-xs bg-gray-50 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">ক্যালেন্ডার ফাইলের শিরোনাম</label>
              <input
                type="text"
                value={pdfTitle}
                onChange={(e) => setPdfTitle(e.target.value)}
                placeholder="বার্ষিক ছুটির তালিকা ও শিক্ষাপঞ্জি ২০২৫"
                className="w-full border rounded-xl p-2.5 text-xs bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">নতুন PDF ফাইল নির্বাচন করুন</label>
              <div className="flex gap-2">
                <input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-gray-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#051939] file:text-white"
                />
                <button
                  type="submit"
                  disabled={uploadingPdf}
                  className="bg-[#06874A] hover:bg-green-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow shrink-0 disabled:opacity-50 cursor-pointer"
                >
                  {uploadingPdf ? "আপলোড..." : "সংরক্ষণ"}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Section 2: Add New Holiday Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-base font-bold text-[#051939] mb-4 flex items-center gap-2">
            <FaPlus className="text-[#06874A]" />
            ছুটির তালিকায় নতুন উপলক্ষ বা ছুটি যোগ করুন
          </h3>

          <form onSubmit={handleAddHoliday} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-700 mb-1">ছুটির বিবরণ / উপলক্ষ</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. পবিত্র শবে বরাত"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full border rounded-xl p-2.5 text-xs bg-gray-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">শুরুর তারিখ</label>
                <input
                  type="text"
                  required
                  placeholder="২০২৫-০২-১৫"
                  value={newStartDate}
                  onChange={(e) => setNewStartDate(e.target.value)}
                  className="w-full border rounded-xl p-2.5 text-xs bg-gray-50 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">সমাপ্তির তারিখ (ঐচ্ছিক)</label>
                <input
                  type="text"
                  placeholder="২০২৫-০২-১৫"
                  value={newEndDate}
                  onChange={(e) => setNewEndDate(e.target.value)}
                  className="w-full border rounded-xl p-2.5 text-xs bg-gray-50 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">মোট দিন</label>
                <input
                  type="text"
                  placeholder="১ দিন / ৩ দিন"
                  value={newTotalDays}
                  onChange={(e) => setNewTotalDays(e.target.value)}
                  className="w-full border rounded-xl p-2.5 text-xs bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">ছুটির ধরন</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  className="w-full border rounded-xl p-2.5 text-xs bg-gray-50"
                >
                  <option value="সরকারি ছুটি">সরকারি ছুটি</option>
                  <option value="জাতীয় দিবস">জাতীয় দিবস</option>
                  <option value="ধর্মীয় উৎসব">ধর্মীয় উৎসব</option>
                  <option value="দীর্ঘকালীন অবকাশ">দীর্ঘকালীন অবকাশ</option>
                  <option value="ঐচ্ছিক ছুটি">ঐচ্ছিক ছুটি</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">সংক্ষিপ্ত মন্তব্য (ঐচ্ছিক)</label>
                <input
                  type="text"
                  placeholder="e.g. বিদ্যালয় বন্ধ থাকবে"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full border rounded-xl p-2.5 text-xs bg-gray-50"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              {editHolidayId && (
                <button
                  type="button"
                  onClick={handleCancelHolidayEdit}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <FaTimes size={12} />
                  <span>বাতিল</span>
                </button>
              )}
              <button
                type="submit"
                disabled={savingHoliday}
                className="bg-[#06874A] hover:bg-green-700 text-white font-bold px-6 py-2.5 rounded-xl shadow text-xs flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {editHolidayId ? <FaSave /> : <FaPlus />}
                <span>
                  {savingHoliday
                    ? "সংরক্ষণ হচ্ছে..."
                    : editHolidayId
                    ? "ছুটি আপডেট করুন"
                    : "ছুটি তালিকায় যুক্ত করুন"}
                </span>
              </button>
            </div>
          </form>
        </div>

        {/* Section 3: List of All Holidays */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h3 className="text-base font-bold text-[#051939]">
              ওয়েবসাইটে সংরক্ষিত ছুটির তালিকা ({holidaysData.holidays?.length || 0})
            </h3>

            <div className="relative w-full sm:w-60">
              <FaSearch className="absolute left-3 top-2.5 text-gray-400 text-xs" />
              <input
                type="text"
                placeholder="ছুটি অনুসন্ধান..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border rounded-xl pl-8 pr-3 py-1.5 text-xs bg-gray-50"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-700 uppercase font-bold border-b">
                  <th className="p-3">ক্রমিক</th>
                  <th className="p-3">ছুটির বিবরণ</th>
                  <th className="p-3">তারিখ</th>
                  <th className="p-3 text-center">মোট দিন</th>
                  <th className="p-3 text-center">ধরন</th>
                  <th className="p-3 text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((h: any, idx: number) => (
                  <tr key={h.id} className="hover:bg-gray-50">
                    <td className="p-3 font-mono text-gray-400">{idx + 1}</td>
                    <td className="p-3 font-bold text-[#051939]">
                      {h.title}
                      {h.description && (
                        <span className="block text-[11px] font-normal text-gray-500">{h.description}</span>
                      )}
                    </td>
                    <td className="p-3 font-mono text-gray-600">
                      {h.startDate}
                      {h.endDate && h.endDate !== h.startDate && <span> থেকে {h.endDate}</span>}
                    </td>
                    <td className="p-3 text-center font-bold text-emerald-700">{h.totalDays}</td>
                    <td className="p-3 text-center">
                      <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-[10px] font-bold">
                        {h.type}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleEditHoliday(h)}
                          className="text-blue-600 hover:text-blue-800 p-1.5 rounded-lg hover:bg-blue-50 transition cursor-pointer"
                          title="এডিট করুন"
                        >
                          <FaEdit size={13} />
                        </button>
                        <button
                          onClick={() => handleDeleteHoliday(h.id, h.title)}
                          className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 transition cursor-pointer"
                          title="মুছে ফেলুন"
                        >
                          <FaTrash size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
