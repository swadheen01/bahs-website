"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useLanguage } from "@/lib/LanguageContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FaArrowLeft,
  FaPlus,
  FaFileCsv,
  FaDownload,
  FaTrash,
  FaSearch,
  FaGraduationCap,
  FaCheckCircle,
  FaTimesCircle,
  FaFileAlt,
  FaUpload,
  FaFilter,
  FaEdit,
  FaTimes,
} from "react-icons/fa";

export default function AdminResultsPage() {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  const [results, setResults] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Filters
  const [filterClass, setFilterClass] = useState("all");
  const [filterExam, setFilterExam] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [editResultId, setEditResultId] = useState<string | null>(null);

  // Single Add Form state
  const [newResult, setNewResult] = useState({
    studentName: "",
    studentNameEn: "",
    roll: "",
    class: "6",
    section: "ক",
    exam: "বার্ষিক পরীক্ষা",
    year: "2025",
    gpa: "5.00",
    grade: "A+",
    status: "উত্তীর্ণ",
    statusEn: "Passed",
    bangla: "85",
    english: "80",
    math: "90",
    science: "85",
    social: "80",
    ict: "90",
    religion: "90",
  });

  // Bulk CSV state
  const [csvPreview, setCsvPreview] = useState<any[]>([]);
  const [csvFileName, setCsvFileName] = useState("");

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  const loadResults = async () => {
    setFetching(true);
    try {
      const res = await fetch("/api/results");
      const data = await res.json();
      if (data.results) {
        setResults(data.results);
      }
    } catch (err) {
      console.error(err);
    }
    setFetching(false);
  };

  useEffect(() => {
    if (user?.role === "admin") loadResults();
  }, [user]);

  // Handle Single Add
  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResult.studentName || !newResult.roll) {
      alert("নাম ও রোল নম্বর আবশ্যক");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        studentName: newResult.studentName,
        studentNameEn: newResult.studentNameEn || newResult.studentName,
        roll: newResult.roll,
        class: newResult.class,
        section: newResult.section,
        exam: newResult.exam,
        year: newResult.year,
        gpa: newResult.gpa,
        grade: newResult.grade,
        status: newResult.status,
        statusEn: newResult.status === "উত্তীর্ণ" ? "Passed" : "Failed",
        marks: {
          বাংলা: Number(newResult.bangla) || 0,
          ইংরেজি: Number(newResult.english) || 0,
          গণিত: Number(newResult.math) || 0,
          বিজ্ঞান: Number(newResult.science) || 0,
          সমাজ: Number(newResult.social) || 0,
          আইসিটি: Number(newResult.ict) || 0,
          ধর্ম: Number(newResult.religion) || 0,
        },
        totalMarks:
          (Number(newResult.bangla) || 0) +
          (Number(newResult.english) || 0) +
          (Number(newResult.math) || 0) +
          (Number(newResult.science) || 0) +
          (Number(newResult.social) || 0) +
          (Number(newResult.ict) || 0) +
          (Number(newResult.religion) || 0),
      };

      const isEditing = editResultId !== null;
      const res = await fetch("/api/results", {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isEditing ? { ...payload, id: editResultId } : payload),
      });

      if (res.ok) {
        setSuccessMsg(isEditing ? "ফলাফল সফলভাবে আপডেট করা হয়েছে!" : "নতুন ফলাফল সফলভাবে যোগ করা হয়েছে!");
        setShowAddModal(false);
        setEditResultId(null);
        loadResults();
        setTimeout(() => setSuccessMsg(""), 3500);
      } else {
        alert("সংরক্ষণ ব্যর্থ হয়েছে");
      }
    } catch (err) {
      alert("ত্রুটি দেখা দিয়েছে");
    }
    setSaving(false);
  };

  const handleEdit = (r: any) => {
    setEditResultId(r.id);
    setNewResult({
      studentName: r.studentName || "",
      studentNameEn: r.studentNameEn || r.studentName || "",
      roll: String(r.roll || ""),
      class: String(r.class || "6"),
      section: r.section || "ক",
      exam: r.exam || "বার্ষিক পরীক্ষা",
      year: String(r.year || "2026"),
      gpa: String(r.gpa || "5.00"),
      grade: r.grade || "A+",
      status: r.status || "উত্তীর্ণ",
      statusEn: r.statusEn || "Passed",
      bangla: String(r.marks?.বাংলা || "0"),
      english: String(r.marks?.ইংরেজি || "0"),
      math: String(r.marks?.গণিত || "0"),
      science: String(r.marks?.বিজ্ঞান || "0"),
      social: String(r.marks?.সমাজ || "0"),
      ict: String(r.marks?.আইসিটি || "0"),
      religion: String(r.marks?.ধর্ম || "0"),
    });
    setShowAddModal(true);
  };

  // CSV parsing
  const handleCsvFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
      if (lines.length < 2) {
        alert("CSV ফাইলে পর্যাপ্ত তথ্য নেই");
        return;
      }

      // Expected header: roll,name,class,section,exam,year,gpa,grade,status,bangla,english,math,science,social,ict,religion
      const parsed: any[] = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
        if (cols.length >= 6) {
          const [
            roll,
            studentName,
            cls,
            section = "ক",
            exam = "বার্ষিক পরীক্ষা",
            year = "2025",
            gpa = "5.00",
            grade = "A+",
            status = "উত্তীর্ণ",
            bangla = "80",
            english = "80",
            math = "80",
            science = "80",
            social = "80",
            ict = "80",
            religion = "80",
          ] = cols;

          const total =
            (Number(bangla) || 0) +
            (Number(english) || 0) +
            (Number(math) || 0) +
            (Number(science) || 0) +
            (Number(social) || 0) +
            (Number(ict) || 0) +
            (Number(religion) || 0);

          parsed.push({
            roll,
            studentName,
            studentNameEn: studentName,
            class: cls.replace(/[^0-9]/g, "") || "6",
            section,
            exam,
            year,
            gpa,
            grade,
            status,
            statusEn: status.includes("উত্তীর্ণ") ? "Passed" : "Failed",
            marks: {
              বাংলা: Number(bangla) || 0,
              ইংরেজি: Number(english) || 0,
              গণিত: Number(math) || 0,
              বিজ্ঞান: Number(science) || 0,
              সমাজ: Number(social) || 0,
              আইসিটি: Number(ict) || 0,
              ধর্ম: Number(religion) || 0,
            },
            totalMarks: total,
          });
        }
      }
      setCsvPreview(parsed);
    };
    reader.readAsText(file);
  };

  const handleBulkUploadSubmit = async () => {
    if (csvPreview.length === 0) {
      alert("আপলোড করার মতো কোনো তথ্য নেই");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(csvPreview),
      });
      if (res.ok) {
        setSuccessMsg(`একসাথে ${csvPreview.length} টি শিক্ষার্থীর ফলাফল সফলভাবে যোগ করা হয়েছে!`);
        setShowBulkModal(false);
        setCsvPreview([]);
        setCsvFileName("");
        loadResults();
        setTimeout(() => setSuccessMsg(""), 4000);
      } else {
        alert("বাল্ক আপলোড ব্যর্থ হয়েছে");
      }
    } catch (err) {
      alert("ত্রুটি হয়েছে");
    }
    setSaving(false);
  };

  // Download Sample CSV
  const handleDownloadSampleCsv = () => {
    const csvContent =
      "roll,studentName,class,section,exam,year,gpa,grade,status,bangla,english,math,science,social,ict,religion\n" +
      "1,মোঃ তানভীর আহমেদ,6,ক,বার্ষিক পরীক্ষা,2025,5.00,A+,উত্তীর্ণ,88,85,95,92,86,94,90\n" +
      "2,ফাতেমা জান্নাত,6,ক,বার্ষিক পরীক্ষা,2025,4.85,A,উত্তীর্ণ,82,80,88,85,84,90,88\n" +
      "3,মোঃ সোহাগ মিয়া,6,ক,বার্ষিক পরীক্ষা,2025,4.50,A,উত্তীর্ণ,75,72,85,80,78,85,82\n" +
      "1,সাদিয়া আক্তার,7,ক,বার্ষিক পরীক্ষা,2025,5.00,A+,উত্তীর্ণ,86,84,96,91,88,95,92\n" +
      "1,আহসান হাবীব,8,ক,বার্ষিক পরীক্ষা,2025,5.00,A+,উত্তীর্ণ,85,88,98,94,89,96,91\n" +
      "1,রাকিবুল হাসান,9,বিজ্ঞান,বার্ষিক পরীক্ষা,2025,5.00,A+,উত্তীর্ণ,84,86,95,90,88,94,90\n" +
      "1,নুসরাত জাহান মিম,10,বিজ্ঞান,প্রাক-নির্বাচনী পরীক্ষা,2025,5.00,A+,উত্তীর্ণ,89,87,98,94,92,96,95\n";

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "bahs_sample_results_format.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Delete Result
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`আপনি কি নিশ্চিত যে "${name}"-এর ফলাফল মুছে ফেলতে চান?`)) return;
    try {
      const res = await fetch(`/api/results?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setResults((prev) => prev.filter((r) => r.id !== id));
      } else {
        alert("মুছে ফেলা সম্ভব হয়নি");
      }
    } catch (err) {
      alert("ত্রুটি হয়েছে");
    }
  };

  // Filtered List
  const filteredResults = results.filter((item) => {
    if (filterClass !== "all" && String(item.class) !== filterClass) return false;
    if (filterExam !== "all" && item.exam !== filterExam) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchRoll = String(item.roll).toLowerCase().includes(q);
      const matchName = String(item.studentName).toLowerCase().includes(q);
      if (!matchRoll && !matchName) return false;
    }
    return true;
  });

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
            <FaGraduationCap className="text-emerald-400" />
            পরীক্ষার ফলাফল ও মার্কশিট ব্যবস্থাপনা
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/academics/results"
            target="_blank"
            className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg border border-white/20 transition"
          >
            পাবলিক রেজাল্ট পেজ দেখুন →
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl space-y-6">
        {/* Action Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-[#051939]">শিক্ষার্থীদের ফলাফল ও মার্কশিট প্যানেল</h2>
            <p className="text-xs text-gray-500 mt-1">
              ৬ষ্ঠ থেকে ১০ম শ্রেণির অভ্যন্তরীণ পরীক্ষার ফলাফল যোগ করুন অথবা এক্সেল / CSV ফাইল দিয়ে একসাথে আপলোড করুন।
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setShowBulkModal(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl shadow transition cursor-pointer"
            >
              <FaFileCsv size={16} />
              <span>এক্সেল / CSV বাল্ক আপলোড</span>
            </button>

            <button
              onClick={() => {
                setEditResultId(null);
                setShowAddModal(true);
              }}
              className="flex items-center gap-2 bg-[#06874A] hover:bg-green-700 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl shadow transition cursor-pointer"
            >
              <FaPlus size={14} />
              <span>একক ফলাফল যোগ করুন</span>
            </button>
          </div>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 flex items-center gap-2 font-bold text-sm shadow-sm animate-in fade-in">
            <FaCheckCircle className="text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
            <span className="text-xs text-gray-500 font-bold block">মোট আপলোডকৃত ফলাফল</span>
            <span className="text-2xl font-black text-[#051939] font-mono">{results.length}</span>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
            <span className="text-xs text-gray-500 font-bold block">উত্তীর্ণ শিক্ষার্থী (Passed)</span>
            <span className="text-2xl font-black text-emerald-600 font-mono">
              {results.filter((r) => r.status === "উত্তীর্ণ" || r.statusEn === "Passed").length}
            </span>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
            <span className="text-xs text-gray-500 font-bold block">জেএসসি ও এসএসসি ফলাফল</span>
            <span className="text-xs font-bold text-blue-600 block mt-1">শিক্ষা বোর্ড সার্ভার লিঙ্কড</span>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
            <span className="text-xs text-gray-500 font-bold block">নমুনা এক্সেল টেমপ্লেট</span>
            <button
              onClick={handleDownloadSampleCsv}
              className="text-xs font-bold text-[#06874A] hover:underline flex items-center gap-1 mt-1 cursor-pointer"
            >
              <FaDownload size={11} /> ডাউনলোড করুন
            </button>
          </div>
        </div>

        {/* Filters and Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-gray-500 flex items-center gap-1">
                <FaFilter size={10} /> ফিল্টার:
              </span>

              {/* Class Filter */}
              <select
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                className="border rounded-lg text-xs p-2 bg-gray-50 text-gray-700"
              >
                <option value="all">সকল শ্রেণি</option>
                <option value="6">৬ষ্ঠ শ্রেণি</option>
                <option value="7">৭ম শ্রেণি</option>
                <option value="8">৮ম শ্রেণি</option>
                <option value="9">৯ম শ্রেণি</option>
                <option value="10">১০ম শ্রেণি</option>
              </select>

              {/* Exam Filter */}
              <select
                value={filterExam}
                onChange={(e) => setFilterExam(e.target.value)}
                className="border rounded-lg text-xs p-2 bg-gray-50 text-gray-700"
              >
                <option value="all">সকল পরীক্ষা</option>
                <option value="বার্ষিক পরীক্ষা">বার্ষিক পরীক্ষা</option>
                <option value="অর্ধ-বার্ষিক পরীক্ষা">অর্ধ-বার্ষিক পরীক্ষা</option>
                <option value="প্রাক-নির্বাচনী পরীক্ষা">প্রাক-নির্বাচনী পরীক্ষা</option>
              </select>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-64">
              <FaSearch className="absolute left-3 top-2.5 text-gray-400 text-xs" />
              <input
                type="text"
                placeholder="রোল বা শিক্ষার্থীর নাম খুঁজুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border rounded-lg pl-8 pr-3 py-1.5 text-xs bg-gray-50 focus:bg-white"
              />
            </div>
          </div>

          {/* Results Table */}
          {fetching ? (
            <div className="text-center py-12 text-gray-400 text-sm">লোড হচ্ছে...</div>
          ) : filteredResults.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">কোনো ফলাফল পাওয়া যায়নি</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100 text-[#051939] uppercase font-bold border-b">
                    <th className="py-2.5 px-3">রোল</th>
                    <th className="py-2.5 px-3">নাম</th>
                    <th className="py-2.5 px-3">শ্রেণি</th>
                    <th className="py-2.5 px-3">শাখা</th>
                    <th className="py-2.5 px-3">পরীক্ষা</th>
                    <th className="py-2.5 px-3">বছর</th>
                    <th className="py-2.5 px-3 text-center">GPA</th>
                    <th className="py-2.5 px-3 text-center">অবস্থা</th>
                    <th className="py-2.5 px-3 text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredResults.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50">
                      <td className="py-2.5 px-3 font-mono font-bold text-[#051939]">{r.roll}</td>
                      <td className="py-2.5 px-3 font-semibold text-gray-800">{r.studentName}</td>
                      <td className="py-2.5 px-3">{r.class}ম শ্রেণি</td>
                      <td className="py-2.5 px-3">{r.section || "ক"}</td>
                      <td className="py-2.5 px-3 text-gray-600">{r.exam}</td>
                      <td className="py-2.5 px-3 font-mono">{r.year}</td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-emerald-700">
                        {r.gpa || "-"} ({r.grade || "A+"})
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            r.status === "উত্তীর্ণ" || r.statusEn === "Passed"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {r.status || "উত্তীর্ণ"}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleEdit(r)}
                            className="text-blue-500 hover:text-blue-700 p-1.5 rounded-lg hover:bg-blue-50 transition cursor-pointer"
                            title="এডিট করুন"
                          >
                            <FaEdit size={12} />
                          </button>
                          <button
                            onClick={() => handleDelete(r.id, r.studentName)}
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
          )}
        </div>
      </div>

      {/* SINGLE ADD MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-base font-bold text-[#051939] flex items-center gap-2">
                {editResultId ? <FaEdit className="text-blue-600" /> : <FaPlus className="text-[#06874A]" />}
                {editResultId ? "শিক্ষার্থীর ফলাফল আপডেট করুন" : "একক শিক্ষার্থীর পরীক্ষার ফলাফল যোগ করুন"}
              </h3>
              <button
                onClick={() => { setShowAddModal(false); setEditResultId(null); }}
                className="text-gray-400 hover:text-gray-600 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSingleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">শিক্ষার্থীর নাম (বাংলা)</label>
                  <input
                    type="text"
                    required
                    value={newResult.studentName}
                    onChange={(e) => setNewResult({ ...newResult, studentName: e.target.value })}
                    placeholder="e.g. মোঃ তানভীর আহমেদ"
                    className="w-full border rounded-lg p-2 text-xs bg-gray-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">রোল নম্বর</label>
                  <input
                    type="number"
                    required
                    value={newResult.roll}
                    onChange={(e) => setNewResult({ ...newResult, roll: e.target.value })}
                    placeholder="e.g. 1"
                    className="w-full border rounded-lg p-2 text-xs bg-gray-50 focus:bg-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">শ্রেণি</label>
                  <select
                    value={newResult.class}
                    onChange={(e) => setNewResult({ ...newResult, class: e.target.value })}
                    className="w-full border rounded-lg p-2 text-xs bg-gray-50"
                  >
                    <option value="6">৬ষ্ঠ শ্রেণি</option>
                    <option value="7">৭ম শ্রেণি</option>
                    <option value="8">৮ম শ্রেণি</option>
                    <option value="9">৯ম শ্রেণি</option>
                    <option value="10">১০ম শ্রেণি</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">শাখা / বিভাগ</label>
                  <input
                    type="text"
                    value={newResult.section}
                    onChange={(e) => setNewResult({ ...newResult, section: e.target.value })}
                    placeholder="ক / খ / বিজ্ঞান"
                    className="w-full border rounded-lg p-2 text-xs bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">শিক্ষাবর্ষ</label>
                  <input
                    type="text"
                    value={newResult.year}
                    onChange={(e) => setNewResult({ ...newResult, year: e.target.value })}
                    placeholder="2025"
                    className="w-full border rounded-lg p-2 text-xs bg-gray-50 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">পরীক্ষা</label>
                  <select
                    value={newResult.exam}
                    onChange={(e) => setNewResult({ ...newResult, exam: e.target.value })}
                    className="w-full border rounded-lg p-2 text-xs bg-gray-50"
                  >
                    <option value="বার্ষিক পরীক্ষা">বার্ষিক পরীক্ষা</option>
                    <option value="অর্ধ-বার্ষিক পরীক্ষা">অর্ধ-বার্ষিক পরীক্ষা</option>
                    <option value="প্রাক-নির্বাচনী পরীক্ষা">প্রাক-নির্বাচনী পরীক্ষা</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">GPA</label>
                  <input
                    type="text"
                    value={newResult.gpa}
                    onChange={(e) => setNewResult({ ...newResult, gpa: e.target.value })}
                    placeholder="5.00"
                    className="w-full border rounded-lg p-2 text-xs bg-gray-50 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">ফলাফলের অবস্থা</label>
                  <select
                    value={newResult.status}
                    onChange={(e) => setNewResult({ ...newResult, status: e.target.value })}
                    className="w-full border rounded-lg p-2 text-xs bg-gray-50"
                  >
                    <option value="উত্তীর্ণ">উত্তীর্ণ (Passed)</option>
                    <option value="অনুত্তীর্ণ">অনুত্তীর্ণ (Failed)</option>
                  </select>
                </div>
              </div>

              {/* Marks Section */}
              <div className="border-t pt-3">
                <span className="text-xs font-bold text-gray-700 block mb-2">বিষয়ভিত্তিক নম্বরসমূহ (Marks out of 100):</span>
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="block text-[11px] text-gray-500">বাংলা</label>
                    <input
                      type="number"
                      value={newResult.bangla}
                      onChange={(e) => setNewResult({ ...newResult, bangla: e.target.value })}
                      className="w-full border rounded p-1.5 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-500">ইংরেজি</label>
                    <input
                      type="number"
                      value={newResult.english}
                      onChange={(e) => setNewResult({ ...newResult, english: e.target.value })}
                      className="w-full border rounded p-1.5 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-500">গণিত</label>
                    <input
                      type="number"
                      value={newResult.math}
                      onChange={(e) => setNewResult({ ...newResult, math: e.target.value })}
                      className="w-full border rounded p-1.5 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-500">বিজ্ঞান</label>
                    <input
                      type="number"
                      value={newResult.science}
                      onChange={(e) => setNewResult({ ...newResult, science: e.target.value })}
                      className="w-full border rounded p-1.5 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-500">সমাজ</label>
                    <input
                      type="number"
                      value={newResult.social}
                      onChange={(e) => setNewResult({ ...newResult, social: e.target.value })}
                      className="w-full border rounded p-1.5 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-500">আইসিটি</label>
                    <input
                      type="number"
                      value={newResult.ict}
                      onChange={(e) => setNewResult({ ...newResult, ict: e.target.value })}
                      className="w-full border rounded p-1.5 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-500">ধর্ম</label>
                    <input
                      type="number"
                      value={newResult.religion}
                      onChange={(e) => setNewResult({ ...newResult, religion: e.target.value })}
                      className="w-full border rounded p-1.5 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); setEditResultId(null); }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-[#06874A] hover:bg-green-700 text-white text-xs font-bold px-5 py-2 rounded-xl shadow disabled:opacity-50"
                >
                  {saving
                    ? "সংরক্ষণ হচ্ছে..."
                    : editResultId
                    ? "ফলাফল আপডেট করুন"
                    : "ফলাফল সংরক্ষণ করুন"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BULK CSV MODAL */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-base font-bold text-[#051939] flex items-center gap-2">
                <FaFileCsv className="text-blue-600 text-lg" />
                এক্সেল / CSV ফরম্যাটে ফলাফল বাল্ক আপলোড
              </h3>
              <button
                onClick={() => setShowBulkModal(false)}
                className="text-gray-400 hover:text-gray-600 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl space-y-2 text-xs text-blue-950">
              <p className="font-bold flex items-center gap-1.5">
                <FaDownload /> প্রথমে নমুনা ফরম্যাট ডাউনলোড করে এক্সেল বা স্প্রেডশিটে তথ্য সাজিয়ে নিন:
              </p>
              <button
                onClick={handleDownloadSampleCsv}
                className="bg-white text-blue-700 border border-blue-300 font-bold px-3 py-1.5 rounded-lg shadow-sm hover:bg-blue-100 transition inline-flex items-center gap-1.5 cursor-pointer"
              >
                <FaDownload size={11} /> নমুনা ফরম্যাট (.csv) ডাউনলোড করুন
              </button>
              <p className="text-[11px] text-gray-600">
                কলামসমূহ: <code className="bg-white px-1 py-0.5 rounded">roll,studentName,class,section,exam,year,gpa,grade,status,bangla,english,math,science,social,ict,religion</code>
              </p>
            </div>

            {/* Upload Input */}
            <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center hover:border-blue-500 transition">
              <input
                type="file"
                accept=".csv"
                id="csvFilePicker"
                onChange={handleCsvFile}
                className="hidden"
              />
              <label
                htmlFor="csvFilePicker"
                className="flex flex-col items-center justify-center gap-2 cursor-pointer"
              >
                <FaUpload className="text-3xl text-gray-400" />
                <span className="text-xs font-bold text-gray-700">
                  {csvFileName ? `নির্বাচিত ফাইল: ${csvFileName}` : "আপনার সংরক্ষিত .CSV ফাইল নির্বাচন করতে ক্লিক করুন"}
                </span>
                <span className="text-[11px] text-gray-400">শুধুমাত্র .csv ফাইল সমর্থিত</span>
              </label>
            </div>

            {/* CSV Preview */}
            {csvPreview.length > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-gray-700">
                  <span>আপলোডের জন্য প্রস্তুত ({csvPreview.length} টি শিক্ষার্থী):</span>
                </div>
                <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-xl">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-gray-100 font-bold text-gray-700 sticky top-0">
                      <tr>
                        <th className="p-2">রোল</th>
                        <th className="p-2">নাম</th>
                        <th className="p-2">শ্রেণি</th>
                        <th className="p-2">পরীক্ষা</th>
                        <th className="p-2">GPA</th>
                        <th className="p-2">অবস্থা</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {csvPreview.map((item, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="p-2 font-mono">{item.roll}</td>
                          <td className="p-2 font-semibold">{item.studentName}</td>
                          <td className="p-2">{item.class}ম শ্রেণি</td>
                          <td className="p-2 text-gray-500">{item.exam}</td>
                          <td className="p-2 font-mono font-bold text-emerald-600">{item.gpa}</td>
                          <td className="p-2">
                            <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded text-[10px]">
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => {
                  setShowBulkModal(false);
                  setCsvPreview([]);
                  setCsvFileName("");
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleBulkUploadSubmit}
                disabled={csvPreview.length === 0 || saving}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2 rounded-xl shadow disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
              >
                <FaUpload size={12} />
                <span>{saving ? "আপলোড হচ্ছে..." : `সকল ${csvPreview.length} টি ফলাফল আপলোড করুন`}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
