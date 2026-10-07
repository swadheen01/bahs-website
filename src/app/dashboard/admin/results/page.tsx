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
  FaFileExcel,
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
import * as XLSX from "xlsx";

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

  // Excel & CSV parsing using SheetJS
  const handleCsvFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const buffer = event.target?.result as ArrayBuffer;
        const workbook = XLSX.read(buffer, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawRows = XLSX.utils.sheet_to_json(worksheet, { defval: "" }) as any[];

        if (!rawRows || rawRows.length === 0) {
          alert("ফাইলে কোনো তথ্য পাওয়া যায়নি");
          return;
        }

        const parsed: any[] = [];
        for (const row of rawRows) {
          // Helper to extract values supporting English and Bengali headers
          const getVal = (...keys: string[]) => {
            for (const k of keys) {
              if (row[k] !== undefined && row[k] !== null && String(row[k]).trim() !== "") {
                return String(row[k]).trim();
              }
            }
            return "";
          };

          const roll = getVal("roll", "রোল", "Roll");
          const studentName = getVal("studentName", "নাম", "শিক্ষার্থীর নাম", "Name", "Student Name");
          if (!roll && !studentName) continue; // Skip empty rows

          const cls = getVal("class", "শ্রেণি", "শ্রেণী", "Class").replace(/[^0-9]/g, "") || "6";
          const section = getVal("section", "শাখা", "Section") || "ক";
          const exam = getVal("exam", "পরীক্ষা", "পরীক্ষার নাম", "Exam") || "বার্ষিক পরীক্ষা";
          const year = getVal("year", "সাল", "বছর", "Year") || "2025";
          const gpa = getVal("gpa", "জিপিএ", "GPA") || "5.00";
          const grade = getVal("grade", "গ্রেড", "Grade") || "A+";
          const status = getVal("status", "ফলাফল", "অবস্থা", "Status") || "উত্তীর্ণ";

          const bangla = Number(getVal("bangla", "বাংলা", "Bangla")) || 0;
          const english = Number(getVal("english", "ইংরেজি", "English")) || 0;
          const math = Number(getVal("math", "গণিত", "Math", "Mathematics")) || 0;
          const science = Number(getVal("science", "বিজ্ঞান", "Science")) || 0;
          const social = Number(getVal("social", "সমাজ", "বাংলাদেশ ও বিশ্বপরিচয়", "BGS", "Social")) || 0;
          const ict = Number(getVal("ict", "আইসিটি", "তথ্য ও যোগাযোগ প্রযুক্তি", "ICT")) || 0;
          const religion = Number(getVal("religion", "ধর্ম", "ধর্ম ও নৈতিক শিক্ষা", "Religion")) || 0;

          const total = bangla + english + math + science + social + ict + religion;

          parsed.push({
            roll,
            studentName,
            studentNameEn: studentName,
            class: cls,
            section,
            exam,
            year,
            gpa,
            grade,
            status,
            statusEn: status.includes("উত্তীর্ণ") ? "Passed" : "Failed",
            marks: {
              বাংলা: bangla,
              ইংরেজি: english,
              গণিত: math,
              বিজ্ঞান: science,
              সমাজ: social,
              আইসিটি: ict,
              ধর্ম: religion,
            },
            totalMarks: total,
          });
        }

        if (parsed.length === 0) {
          alert("ফাইলে পর্যাপ্ত তথ্য পাওয়া যায়নি। কলামের নামগুলো সঠিক আছে কিনা চেক করুন।");
          return;
        }

        setCsvPreview(parsed);
      } catch (err) {
        console.error("File parse error:", err);
        alert("ফাইলটি পড়তে ত্রুটি হয়েছে। অনুগ্রহ করে সঠিক এক্সেল (.xlsx) বা CSV ফাইল আপলোড করুন।");
      }
    };
    reader.readAsArrayBuffer(file);
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

  // Download Sample Excel (.xlsx)
  const handleDownloadSampleExcel = () => {
    try {
      const sampleData = [
        {
          roll: 1,
          studentName: "মোঃ তানভীর আহমেদ",
          class: "6",
          section: "ক",
          exam: "বার্ষিক পরীক্ষা",
          year: "2025",
          gpa: "5.00",
          grade: "A+",
          status: "উত্তীর্ণ",
          bangla: 88,
          english: 85,
          math: 95,
          science: 92,
          social: 86,
          ict: 94,
          religion: 90
        },
        {
          roll: 2,
          studentName: "ফাতেমা জান্নাত",
          class: "6",
          section: "ক",
          exam: "বার্ষিক পরীক্ষা",
          year: "2025",
          gpa: "4.85",
          grade: "A",
          status: "উত্তীর্ণ",
          bangla: 82,
          english: 80,
          math: 88,
          science: 85,
          social: 84,
          ict: 90,
          religion: 88
        },
        {
          roll: 3,
          studentName: "মোঃ সোহাগ মিয়া",
          class: "6",
          section: "ক",
          exam: "বার্ষিক পরীক্ষা",
          year: "2025",
          gpa: "4.50",
          grade: "A",
          status: "উত্তীর্ণ",
          bangla: 75,
          english: 72,
          math: 85,
          science: 80,
          social: 78,
          ict: 85,
          religion: 82
        },
        {
          roll: 1,
          studentName: "সাদিয়া আক্তার",
          class: "7",
          section: "ক",
          exam: "বার্ষিক পরীক্ষা",
          year: "2025",
          gpa: "5.00",
          grade: "A+",
          status: "উত্তীর্ণ",
          bangla: 86,
          english: 84,
          math: 96,
          science: 91,
          social: 88,
          ict: 95,
          religion: 92
        },
        {
          roll: 1,
          studentName: "আহসান হাবীব",
          class: "8",
          section: "ক",
          exam: "বার্ষিক পরীক্ষা",
          year: "2025",
          gpa: "5.00",
          grade: "A+",
          status: "উত্তীর্ণ",
          bangla: 85,
          english: 88,
          math: 98,
          science: 94,
          social: 89,
          ict: 96,
          religion: 91
        },
        {
          roll: 1,
          studentName: "রাকিবুল হাসান",
          class: "9",
          section: "বিজ্ঞান",
          exam: "বার্ষিক পরীক্ষা",
          year: "2025",
          gpa: "5.00",
          grade: "A+",
          status: "উত্তীর্ণ",
          bangla: 84,
          english: 86,
          math: 95,
          science: 90,
          social: 88,
          ict: 94,
          religion: 90
        },
        {
          roll: 1,
          studentName: "নুসরাত জাহান মিম",
          class: "10",
          section: "বিজ্ঞান",
          exam: "প্রাক-নির্বাচনী পরীক্ষা",
          year: "2025",
          gpa: "5.00",
          grade: "A+",
          status: "উত্তীর্ণ",
          bangla: 89,
          english: 87,
          math: 98,
          science: 94,
          social: 92,
          ict: 96,
          religion: 95
        }
      ];

      const ws = XLSX.utils.json_to_sheet(sampleData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Results");
      XLSX.writeFile(wb, "bahs_sample_results_format.xlsx");
    } catch (e) {
      const link = document.createElement("a");
      link.href = "/downloads/results/bahs_sample_results_format.xlsx";
      link.setAttribute("download", "bahs_sample_results_format.xlsx");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Download Sample CSV
  const handleDownloadSampleCsv = () => {
    const link = document.createElement("a");
    link.href = "/downloads/results/bahs_sample_results_format.csv";
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
              className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl shadow transition cursor-pointer"
            >
              <FaFileExcel size={16} />
              <span>এক্সেল (.xlsx) বাল্ক আপলোড</span>
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
            <span className="text-xs text-gray-500 font-bold block flex items-center gap-1">
              <FaFileExcel className="text-emerald-600" /> নমুনা এক্সেল টেমপ্লেট
            </span>
            <button
              onClick={handleDownloadSampleExcel}
              className="text-xs font-bold text-[#06874A] hover:underline flex items-center gap-1 mt-1 cursor-pointer"
            >
              <FaDownload size={11} /> এক্সেল (.xlsx) ডাউনলোড
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
                <FaFileExcel className="text-emerald-600 text-xl" />
                এক্সেল (.xlsx / .xls) ও CSV বাল্ক আপলোড
              </h3>
              <button
                onClick={() => setShowBulkModal(false)}
                className="text-gray-400 hover:text-gray-600 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl space-y-2 text-xs text-emerald-950">
              <p className="font-bold flex items-center gap-1.5 text-emerald-900">
                <FaDownload className="text-emerald-700" /> প্রথমে ডেমো এক্সেল ফাইল ডাউনলোড করে শিক্ষার্থীদের ফলাফল সাজিয়ে নিন:
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  onClick={handleDownloadSampleExcel}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-1.5 rounded-lg shadow-sm transition inline-flex items-center gap-1.5 cursor-pointer text-xs"
                >
                  <FaFileExcel size={13} /> ডেমো এক্সেল (.xlsx) ডাউনলোড
                </button>
                <button
                  onClick={handleDownloadSampleCsv}
                  className="bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 font-bold px-3 py-1.5 rounded-lg shadow-sm transition inline-flex items-center gap-1.5 cursor-pointer text-xs"
                >
                  <FaFileCsv size={13} /> CSV ফরম্যাট
                </button>
              </div>
              <p className="text-[11px] text-gray-600">
                কলামসমূহ (ইংরেজি বা বাংলা যেকোনোটি ব্যবহার করতে পারেন):<br />
                <code className="bg-white px-1 py-0.5 rounded text-[10px] text-gray-800">roll, studentName, class, section, exam, year, gpa, grade, status, bangla, english, math, science, social, ict, religion</code>
              </p>
            </div>

            {/* Upload Input */}
            <div className="border-2 border-dashed border-gray-300 hover:border-emerald-500 rounded-2xl p-6 text-center transition bg-gray-50/50 hover:bg-emerald-50/20">
              <input
                type="file"
                accept=".xlsx, .xls, .csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel, text/csv"
                id="excelFilePicker"
                onChange={handleCsvFile}
                className="hidden"
              />
              <label
                htmlFor="excelFilePicker"
                className="flex flex-col items-center justify-center gap-2 cursor-pointer"
              >
                <FaFileExcel className="text-4xl text-emerald-600" />
                <span className="text-xs font-bold text-gray-800">
                  {csvFileName ? `নির্বাচিত ফাইল: ${csvFileName}` : "আপনার এক্সেল (.xlsx / .xls) বা .csv ফাইল নির্বাচন করতে ক্লিক করুন"}
                </span>
                <span className="text-[11px] text-gray-500">মাইক্রোসফট এক্সেল (.xlsx, .xls) এবং .csv ফাইল সমর্থিত</span>
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
