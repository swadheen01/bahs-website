"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useLanguage } from "@/lib/LanguageContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FaArrowLeft,
  FaUpload,
  FaFilePdf,
  FaTrash,
  FaSave,
  FaCheckCircle,
  FaCalendarAlt,
  FaClock,
  FaPlus,
  FaEdit,
  FaTimes,
} from "react-icons/fa";

export default function AdminRoutinePage() {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"files" | "weekly">("files");

  // Routine Files State
  const [editFileId, setEditFileId] = useState<string | null>(null);
  const [existingFileUrl, setExistingFileUrl] = useState<string>("");
  const [routineFiles, setRoutineFiles] = useState<any[]>([]);
  const [fileTitle, setFileTitle] = useState("");
  const [fileClass, setFileClass] = useState("all");
  const [fileYear, setFileYear] = useState("2025");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Weekly Table State
  const [selectedClass, setSelectedClass] = useState("6");
  const [weeklyRoutines, setWeeklyRoutines] = useState<any>({});
  const [currentSlots, setCurrentSlots] = useState<any[]>([]);

  const [savingWeekly, setSavingWeekly] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  const loadRoutines = async () => {
    try {
      const res = await fetch("/api/routines");
      const data = await res.json();
      if (data.routineFiles) setRoutineFiles(data.routineFiles);
      if (data.weeklyRoutines) {
        setWeeklyRoutines(data.weeklyRoutines);
        setCurrentSlots(data.weeklyRoutines[selectedClass] || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (user?.role === "admin") loadRoutines();
  }, [user]);

  useEffect(() => {
    if (weeklyRoutines[selectedClass]) {
      setCurrentSlots(weeklyRoutines[selectedClass]);
    }
  }, [selectedClass, weeklyRoutines]);

  // Handle Routine File Upload or Edit
  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    const isEditing = editFileId !== null;
    if (!fileTitle || (!selectedFile && !existingFileUrl)) {
      alert("শিরোনাম এবং ফাইল উভয়ই আবশ্যক");
      return;
    }
    setUploading(true);
    try {
      let fileUrl = existingFileUrl;
      if (selectedFile) {
        // Step 1: Upload file to /api/upload
        const formData = new FormData();
        formData.append("file", selectedFile);
        const upRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const upData = await upRes.json();
        if (!upRes.ok || !upData.url) {
          alert("ফাইল সার্ভারে আপলোড হতে ব্যর্থ হয়েছে");
          setUploading(false);
          return;
        }
        fileUrl = upData.url;
      }

      // Step 2: Save metadata to /api/routines
      const res = await fetch("/api/routines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: isEditing ? "editFile" : "uploadFile",
          id: editFileId || undefined,
          title: fileTitle,
          class: fileClass,
          year: fileYear,
          fileUrl,
        }),
      });

      if (res.ok) {
        setSuccessMsg(isEditing ? "ক্লাস রুটিন ফাইল সফলভাবে আপডেট করা হয়েছে!" : "ক্লাস রুটিন ফাইল সফলভাবে আপলোড ও যুক্ত করা হয়েছে!");
        setFileTitle("");
        setSelectedFile(null);
        setEditFileId(null);
        setExistingFileUrl("");
        loadRoutines();
        setTimeout(() => setSuccessMsg(""), 3500);
      } else {
        alert("রুটিন সংরক্ষণ ব্যর্থ হয়েছে");
      }
    } catch (err) {
      alert("ত্রুটি দেখা দিয়েছে");
    }
    setUploading(false);
  };

  const handleEditFile = (file: any) => {
    setEditFileId(file.id);
    setFileTitle(file.title || "");
    setFileClass(file.class || "all");
    setFileYear(file.year || "2026");
    setExistingFileUrl(file.fileUrl || "");
    setSelectedFile(null);
    window.scrollTo({ top: 300, behavior: "smooth" });
  };

  const handleCancelFileEdit = () => {
    setEditFileId(null);
    setFileTitle("");
    setExistingFileUrl("");
    setSelectedFile(null);
  };

  // Delete Routine File
  const handleDeleteFile = async (id: string, title: string) => {
    if (!confirm(`আপনি কি "${title}" মুছে ফেলতে চান?`)) return;
    try {
      const res = await fetch(`/api/routines?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setRoutineFiles((prev) => prev.filter((f) => f.id !== id));
      } else {
        alert("মুছে ফেলা সম্ভব হয়নি");
      }
    } catch (err) {
      alert("ত্রুটি হয়েছে");
    }
  };

  // Handle Slot Change
  const handleSlotChange = (index: number, field: string, val: string) => {
    const updated = [...currentSlots];
    updated[index] = { ...updated[index], [field]: val };
    setCurrentSlots(updated);
  };

  // Save Weekly Routine
  const handleSaveWeekly = async () => {
    setSavingWeekly(true);
    try {
      const res = await fetch("/api/routines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "updateWeekly",
          class: selectedClass,
          routine: currentSlots,
        }),
      });
      if (res.ok) {
        setSuccessMsg(`${selectedClass}ম শ্রেণির সাপ্তাহিক রুটিন সফলভাবে সংরক্ষিত হয়েছে!`);
        setWeeklyRoutines((prev: any) => ({ ...prev, [selectedClass]: currentSlots }));
        setTimeout(() => setSuccessMsg(""), 3500);
      } else {
        alert("সংরক্ষণ ব্যর্থ হয়েছে");
      }
    } catch (err) {
      alert("ত্রুটি দেখা দিয়েছে");
    }
    setSavingWeekly(false);
  };

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-gray-100 font-bengali pb-20">
      {/* Top Header */}
      <header className="bg-[#051939] text-white px-6 py-4 flex items-center justify-between shadow">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/admin" className="text-gray-300 hover:text-white text-sm flex items-center gap-1">
            <FaArrowLeft /> ড্যাশবোর্ড
          </Link>
          <span className="text-gray-600">|</span>
          <h1 className="text-lg font-bold flex items-center gap-2">
            <FaClock className="text-yellow-400" />
            ক্লাস রুটিন ও সময়সূচি ব্যবস্থাপনা
          </h1>
        </div>

        <Link
          href="/academics/routine"
          target="_blank"
          className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg border border-white/20 transition"
        >
          পাবলিক রুটিন দেখুন →
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

        {/* Tab Buttons */}
        <div className="bg-white rounded-2xl p-2 shadow-sm border border-gray-200 flex gap-2">
          <button
            onClick={() => setActiveTab("files")}
            className={`flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition cursor-pointer ${
              activeTab === "files" ? "bg-[#051939] text-white shadow" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <FaFilePdf />
            <span>রুটিন ফাইল ও PDF আপলোড (Downloadable Routines)</span>
          </button>

          <button
            onClick={() => setActiveTab("weekly")}
            className={`flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition cursor-pointer ${
              activeTab === "weekly" ? "bg-[#06874A] text-white shadow" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <FaCalendarAlt />
            <span>সাপ্তাহিক রুটিন টেবিল এডিটর (Interactive Routine)</span>
          </button>
        </div>

        {/* TAB 1: ROUTINE FILE UPLOAD */}
        {activeTab === "files" && (
          <div className="space-y-6">
            {/* Upload Form Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-base font-bold text-[#051939] mb-4 flex items-center gap-2">
                <FaUpload className="text-[#06874A]" />
                নতুন রুটিন ফাইল বা নোটিশ আপলোড করুন (PDF বা ছবি)
              </h3>

              <form onSubmit={handleFileUpload} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      রুটিনের শিরোনাম (বাংলা)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. বার্ষিক ক্লাস রুটিন ২০২৫ (সকল শ্রেণি)"
                      value={fileTitle}
                      onChange={(e) => setFileTitle(e.target.value)}
                      className="w-full border rounded-xl p-2.5 text-xs bg-gray-50 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">শ্রেণি</label>
                    <select
                      value={fileClass}
                      onChange={(e) => setFileClass(e.target.value)}
                      className="w-full border rounded-xl p-2.5 text-xs bg-gray-50"
                    >
                      <option value="all">সকল শ্রেণি (All Classes)</option>
                      <option value="6">৬ষ্ঠ শ্রেণি</option>
                      <option value="7">৭ম শ্রেণি</option>
                      <option value="8">৮ম শ্রেণি</option>
                      <option value="9">৯ম শ্রেণি</option>
                      <option value="10">১০ম শ্রেণি</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">শিক্ষাবর্ষ</label>
                    <input
                      type="text"
                      value={fileYear}
                      onChange={(e) => setFileYear(e.target.value)}
                      placeholder="2025"
                      className="w-full border rounded-xl p-2.5 text-xs bg-gray-50 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      PDF বা ছবির ফাইল {editFileId ? "(ঐচ্ছিক, পরিবর্তন করতে চাইলে)" : "নির্বাচন করুন *"}
                    </label>
                    <input
                      type="file"
                      required={!editFileId}
                      accept=".pdf,image/*"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      className="w-full text-xs text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#051939] file:text-white hover:file:bg-[#06874A] cursor-pointer"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  {editFileId && (
                    <button
                      type="button"
                      onClick={handleCancelFileEdit}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <FaTimes size={12} />
                      <span>বাতিল</span>
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={uploading}
                    className="bg-[#06874A] hover:bg-green-700 text-white font-bold px-6 py-2.5 rounded-xl shadow text-xs flex items-center gap-2 disabled:opacity-60 cursor-pointer"
                  >
                    {editFileId ? <FaSave /> : <FaUpload />}
                    <span>
                      {uploading
                        ? "আপলোড হচ্ছে..."
                        : editFileId
                        ? "রুটিন ফাইল আপডেট করুন"
                        : "রুটিন ফাইল যোগ করুন"}
                    </span>
                  </button>
                </div>
              </form>
            </div>

            {/* List of Uploaded Files */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-base font-bold text-[#051939] mb-4 flex items-center gap-2">
                <FaFilePdf className="text-red-500" />
                ওয়েবসাইটে প্রদর্শিত রুটিন ফাইলের তালিকা ({routineFiles.length})
              </h3>

              {routineFiles.length === 0 ? (
                <p className="text-xs text-gray-400 py-6 text-center">এখনো কোনো ফাইল আপলোড করা হয়নি</p>
              ) : (
                <div className="divide-y divide-gray-100">
                  {routineFiles.map((file: any) => (
                    <div key={file.id} className="py-3 flex items-center justify-between gap-4 hover:bg-gray-50 px-2 rounded-xl transition">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                          <FaFilePdf size={18} />
                        </span>
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-[#051939] truncate">{file.title}</h4>
                          <span className="text-[11px] text-gray-500">
                            {file.class === "all" ? "সকল শ্রেণি" : `${file.class}ম শ্রেণি`} • শিক্ষাবর্ষ: {file.year}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <a
                          href={file.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg font-bold transition"
                        >
                          ডাউনলোড
                        </a>
                        <button
                          onClick={() => handleEditFile(file)}
                          className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition cursor-pointer"
                          title="এডিট করুন"
                        >
                          <FaEdit size={13} />
                        </button>
                        <button
                          onClick={() => handleDeleteFile(file.id, file.title)}
                          className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition cursor-pointer"
                          title="মুছে ফেলুন"
                        >
                          <FaTrash size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: WEEKLY ROUTINE TABLE EDITOR */}
        {activeTab === "weekly" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
              <div>
                <h3 className="text-base font-bold text-[#051939]">সাপ্তাহিক রুটিন টেবিল এডিটর</h3>
                <p className="text-xs text-gray-500">
                  শ্রেণি নির্বাচন করুন এবং রবিবার থেকে বৃহস্পতিবার প্রতিটি পিরিয়ডের পাঠ্য বিষয় সম্পাদন করুন।
                </p>
              </div>

              {/* Class Selector Buttons */}
              <div className="flex gap-2">
                {["6", "7", "8", "9", "10"].map((num) => (
                  <button
                    key={num}
                    onClick={() => setSelectedClass(num)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                      selectedClass === num
                        ? "bg-[#06874A] text-white shadow"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {num}ষ্ঠ/ম শ্রেণি
                  </button>
                ))}
              </div>
            </div>

            {/* Editable Slots Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100 text-gray-700 uppercase font-bold border-b">
                    <th className="p-2.5">পিরিয়ড</th>
                    <th className="p-2.5">সময়</th>
                    <th className="p-2.5">রবিবার</th>
                    <th className="p-2.5">সোমবার</th>
                    <th className="p-2.5">মঙ্গলবার</th>
                    <th className="p-2.5">বুধবার</th>
                    <th className="p-2.5">বৃহস্পতিবার</th>
                    <th className="p-2.5">কক্ষ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {currentSlots.map((slot: any, idx: number) => {
                    const isBreak = slot.period?.includes("টিফিন") || slot.period?.includes("বিরতি");
                    return (
                      <tr key={idx} className={isBreak ? "bg-amber-50/60" : "hover:bg-gray-50"}>
                        <td className="p-2 font-bold text-[#051939]">
                          <input
                            type="text"
                            value={slot.period || ""}
                            onChange={(e) => handleSlotChange(idx, "period", e.target.value)}
                            className="border rounded p-1 text-xs w-24 bg-white"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={slot.time || ""}
                            onChange={(e) => handleSlotChange(idx, "time", e.target.value)}
                            className="border rounded p-1 text-xs w-28 bg-white font-mono"
                          />
                        </td>

                        {isBreak ? (
                          <td colSpan={5} className="p-2 text-center text-amber-800 font-bold">
                            নামাজ ও দুপুরের টিফিন বিরতি
                          </td>
                        ) : (
                          <>
                            <td className="p-2">
                              <input
                                type="text"
                                value={slot.sunday || ""}
                                onChange={(e) => handleSlotChange(idx, "sunday", e.target.value)}
                                className="border rounded p-1 text-xs w-full bg-white font-semibold text-[#06874A]"
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="text"
                                value={slot.monday || ""}
                                onChange={(e) => handleSlotChange(idx, "monday", e.target.value)}
                                className="border rounded p-1 text-xs w-full bg-white font-semibold text-[#06874A]"
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="text"
                                value={slot.tuesday || ""}
                                onChange={(e) => handleSlotChange(idx, "tuesday", e.target.value)}
                                className="border rounded p-1 text-xs w-full bg-white font-semibold text-[#06874A]"
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="text"
                                value={slot.wednesday || ""}
                                onChange={(e) => handleSlotChange(idx, "wednesday", e.target.value)}
                                className="border rounded p-1 text-xs w-full bg-white font-semibold text-[#06874A]"
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="text"
                                value={slot.thursday || ""}
                                onChange={(e) => handleSlotChange(idx, "thursday", e.target.value)}
                                className="border rounded p-1 text-xs w-full bg-white font-semibold text-[#06874A]"
                              />
                            </td>
                          </>
                        )}

                        <td className="p-2">
                          <input
                            type="text"
                            value={slot.room || ""}
                            onChange={(e) => handleSlotChange(idx, "room", e.target.value)}
                            className="border rounded p-1 text-xs w-16 bg-white font-mono"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-4 border-t">
              <button
                type="button"
                onClick={handleSaveWeekly}
                disabled={savingWeekly}
                className="bg-[#06874A] hover:bg-green-700 text-white font-bold px-8 py-3 rounded-xl shadow text-xs flex items-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                <FaSave />
                <span>
                  {savingWeekly
                    ? "সংরক্ষণ হচ্ছে..."
                    : `${selectedClass}ষ্ঠ/ম শ্রেণির রুটিন সংরক্ষণ করুন`}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
