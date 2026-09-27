"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useLanguage } from "@/lib/LanguageContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FaGraduationCap,
  FaArrowLeft,
  FaSave,
  FaCheckCircle,
  FaUsers,
  FaChartBar,
  FaChalkboardTeacher,
  FaBook,
  FaDoorOpen,
  FaChevronDown,
  FaChevronUp,
  FaPlus,
  FaTrashAlt,
  FaLayerGroup,
} from "react-icons/fa";

export default function AdminClassesStatsPage() {
  const { user, loading } = useAuth();
  const { t, language } = useLanguage();
  const router = useRouter();

  const [classes, setClasses] = useState<any[]>([]);
  const [stats, setStats] = useState<any[]>([]);
  const [vocational, setVocational] = useState<any>({});
  const [totalClasses, setTotalClasses] = useState<any>({});
  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  const [expandedClass, setExpandedClass] = useState<number | null>(6);

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) router.replace("/login");
  }, [user, loading, router]);

  const loadData = async () => {
    setFetching(true);
    try {
      const res = await fetch("/api/school-info");
      const data = await res.json();
      if (data.classes) setClasses(data.classes);
      if (data.stats) setStats(data.stats);
      if (data.vocational) setVocational(data.vocational);
      if (data.totalClasses) setTotalClasses(data.totalClasses);
    } catch (e) {
      console.error(e);
    }
    setFetching(false);
  };

  useEffect(() => {
    if (user?.role === "admin") loadData();
  }, [user]);

  const handleClassChange = (index: number, field: string, val: any) => {
    const updated = [...classes];
    updated[index] = { ...updated[index], [field]: val };
    setClasses(updated);
  };

  const handleSubjectsChange = (index: number, text: string) => {
    const subs = text.split("\n").map((s) => s.trim()).filter(Boolean);
    handleClassChange(index, "subjects", subs);
  };

  const handleStatChange = (index: number, field: string, val: string) => {
    const updated = [...stats];
    updated[index] = { ...updated[index], [field]: val };
    setStats(updated);
  };

  const handleSectionChange = (classIdx: number, sectionIdx: number, field: string, val: string) => {
    const updated = [...classes];
    const target = { ...updated[classIdx] };
    const sections = Array.isArray(target.sections) ? [...target.sections] : [];
    sections[sectionIdx] = { ...sections[sectionIdx], [field]: val };
    target.sections = sections;
    updated[classIdx] = target;
    setClasses(updated);
  };

  const handleAddSection = (classIdx: number) => {
    const updated = [...classes];
    const target = { ...updated[classIdx] };
    const sections = Array.isArray(target.sections) ? [...target.sections] : [];
    sections.push({
      name: "নতুন শাখা",
      nameEn: "New Section",
      classTeacher: "",
      classTeacherEn: "",
      teacherPhone: "",
      room: "",
      students: "",
      studentsEn: "",
    });
    target.sections = sections;
    updated[classIdx] = target;
    setClasses(updated);
  };

  const handleRemoveSection = (classIdx: number, sectionIdx: number) => {
    if (!confirm("আপনি কি নিশ্চিত এই শাখাটি মুছে ফেলতে চান?")) return;
    const updated = [...classes];
    const target = { ...updated[classIdx] };
    const sections = Array.isArray(target.sections) ? [...target.sections] : [];
    sections.splice(sectionIdx, 1);
    target.sections = sections;
    updated[classIdx] = target;
    setClasses(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/school-info", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classes, stats, vocational, totalClasses }),
      });
      if (res.ok) {
        setSuccessMsg(true);
        setTimeout(() => setSuccessMsg(false), 3000);
      }
    } catch (err) {
      alert("তথ্য সংরক্ষণ ব্যর্থ হয়েছে");
    }
    setSaving(false);
  };

  if (loading || !user) return null;

  return (
    <div className={`min-h-screen bg-gray-100 font-bengali pb-20`}>
      <header className="bg-[#051939] text-white px-6 py-4 flex items-center justify-between shadow">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/admin" className="text-gray-300 hover:text-white text-sm flex items-center gap-1">
            <FaArrowLeft /> {t("ড্যাশবোর্ড", "Dashboard")}
          </Link>
          <span className="text-gray-600">|</span>
          <h1 className="text-lg font-bold flex items-center gap-2">
            <FaGraduationCap className="text-yellow-400" />
            {t("শ্রেণি তথ্য, রুটিন ও পরিসংখ্যান ব্যবস্থাপনা", "Class Info, Routine & Stats")}
          </h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-[#051939]">
              {t("শ্রেণিভিত্তিক বিস্তারিত তথ্য ও রুটিন এডিটর", "Class Details & Routine Editor")}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {t(
                "৬ষ্ঠ থেকে ১০ম শ্রেণির শিক্ষক, শিক্ষার্থী সংখ্যা, রুম, পাঠ্য বিষয় এবং হোমপেজ পরিসংখ্যান পরিচালনা করুন।",
                "Manage class teachers, student counts, room numbers, subjects, and stats."
              )}
            </p>
          </div>

          <button
            onClick={handleSubmit}
            disabled={saving || fetching}
            className="flex items-center gap-2 bg-[#06874A] hover:bg-green-700 text-white font-bold px-6 py-2.5 rounded-xl shadow-md transition disabled:opacity-60 cursor-pointer"
          >
            <FaSave />
            <span>{saving ? t("সংরক্ষণ হচ্ছে...", "Saving...") : t("সকল পরিবর্তন সংরক্ষণ করুন", "Save Changes")}</span>
          </button>
        </div>

        {/* Prominent Floating Toast Alert (Visible anywhere on screen) */}
        {successMsg && (
          <div className="fixed top-6 right-6 z-[9999] bg-[#06874A] text-white px-5 py-3.5 rounded-2xl shadow-2xl border-2 border-emerald-300 flex items-center gap-3 animate-in slide-in-from-top duration-300">
            <FaCheckCircle className="text-yellow-300 text-2xl shrink-0" />
            <div>
              <p className="text-sm font-bold">{t("সফলভাবে সংরক্ষিত হয়েছে!", "Saved successfully!")}</p>
              <p className="text-xs text-green-100 font-normal">{t("শ্রেণি ও পরিসংখ্যানের সকল তথ্য ডাটাবেজে আপডেট করা হয়েছে।", "All information updated in database.")}</p>
            </div>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 flex items-center gap-2 font-bold text-sm shadow-sm animate-in fade-in">
            <FaCheckCircle className="text-emerald-600" />
            <span>{t("তথ্য সফলভাবে হালনাগাদ করা হয়েছে!", "Successfully updated class & stats information!")}</span>
          </div>
        )}

        {fetching ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow text-gray-400">
            {t("লোড হচ্ছে...", "Loading...")}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Section 1: Main Statistics (Total Students, Teachers, etc.) */}
            <div className="bg-white rounded-2xl shadow p-6 border-t-4 border-[#051939]">
              <h3 className="font-bold text-lg text-[#051939] mb-4 flex items-center gap-2">
                <FaChartBar className="text-[#06874A]" />
                {t("হোমপেজের প্রধান ৪টি পরিসংখ্যান (Key Stats)", "Key Homepage Statistics")}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {stats.map((stat, i) => (
                  <div key={i} className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2">
                    <p className="text-xs font-bold text-gray-500 uppercase">
                      {stat.label} ({stat.labelEn})
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] text-gray-600 font-medium">সংখ্যা (বাংলা)</label>
                        <input
                          type="text"
                          value={stat.value || ""}
                          onChange={(e) => handleStatChange(i, "value", e.target.value)}
                          className="w-full border rounded-lg px-2.5 py-1.5 text-sm bg-white font-bold text-[#051939]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-gray-600 font-medium">Value (English)</label>
                        <input
                          type="text"
                          value={stat.valueEn || ""}
                          onChange={(e) => handleStatChange(i, "valueEn", e.target.value)}
                          className="w-full border rounded-lg px-2.5 py-1.5 text-sm bg-white font-bold text-[#051939] font-sans"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 2: Detailed Class Info (6th to 10th) */}
            <div className="bg-white rounded-2xl shadow p-6 border-t-4 border-[#06874A]">
              <h3 className="font-bold text-lg text-[#051939] mb-2 flex items-center gap-2">
                <FaUsers className="text-[#06874A]" />
                {t("শ্রেণিভিত্তিক বিস্তারিত তথ্য (Class 6 - 10)", "Class Details (Grade 6 - 10)")}
              </h3>
              <p className="text-xs text-gray-500 mb-6">
                নিচের যেকোনো শ্রেণিতে ক্লিক করে শ্রেণি শিক্ষক, বিষয় ও রুটিনের তথ্য বিস্তারিত সম্পাদন করুন।
              </p>

              <div className="space-y-4">
                {classes.map((cls, i) => {
                  const isExp = expandedClass === cls.num;
                  return (
                    <div
                      key={cls.num}
                      className="rounded-2xl border border-gray-200 overflow-hidden bg-white shadow-sm transition"
                    >
                      {/* Accordion Header */}
                      <button
                        type="button"
                        onClick={() => setExpandedClass(isExp ? null : cls.num)}
                        className="w-full p-4 bg-gray-50 hover:bg-gray-100/80 flex items-center justify-between text-left transition"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-full bg-[#051939] text-white flex items-center justify-center text-sm font-bold shadow-sm">
                            {cls.num}
                          </span>
                          <div>
                            <span className="font-bold text-base text-[#051939] mr-2">
                              {cls.nameBn} ({cls.nameEn})
                            </span>
                            <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                              {cls.students} শিক্ষার্থী • কক্ষ: {cls.room}
                            </span>
                          </div>
                        </div>
                        <div className="text-gray-400">
                          {isExp ? <FaChevronUp size={14} /> : <FaChevronDown size={14} />}
                        </div>
                      </button>

                      {/* Accordion Body */}
                      {isExp && (
                        <div className="p-5 border-t border-gray-200 bg-white space-y-5 animate-in fade-in duration-200">
                          {/* Row 1: Students & Class Teacher */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-gray-600 mb-1">
                                শিক্ষার্থী সংখ্যা (বাংলা)
                              </label>
                              <input
                                type="text"
                                value={cls.students || ""}
                                onChange={(e) => handleClassChange(i, "students", e.target.value)}
                                placeholder="৩০০+"
                                className="w-full border rounded-lg p-2 text-sm bg-gray-50 focus:bg-white"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-600 mb-1">
                                Students (English)
                              </label>
                              <input
                                type="text"
                                value={cls.studentsEn || ""}
                                onChange={(e) => handleClassChange(i, "studentsEn", e.target.value)}
                                placeholder="300+"
                                className="w-full border rounded-lg p-2 text-sm bg-gray-50 focus:bg-white font-sans"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-600 mb-1">শাখা / বিভাগ</label>
                              <input
                                type="text"
                                value={cls.section || ""}
                                onChange={(e) => handleClassChange(i, "section", e.target.value)}
                                placeholder="ক, খ"
                                className="w-full border rounded-lg p-2 text-sm bg-gray-50 focus:bg-white"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-600 mb-1">কক্ষ নম্বর</label>
                              <input
                                type="text"
                                value={cls.room || ""}
                                onChange={(e) => handleClassChange(i, "room", e.target.value)}
                                placeholder="১০১"
                                className="w-full border rounded-lg p-2 text-sm bg-gray-50 focus:bg-white"
                              />
                            </div>
                          </div>

                          {/* Row 2: Class Teacher Details */}
                          <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/80">
                            <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                              <FaChalkboardTeacher /> শ্রেণি শিক্ষক সংক্রান্ত তথ্য
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div>
                                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                                  শ্রেণি শিক্ষকের নাম (বাংলা)
                                </label>
                                <input
                                  type="text"
                                  value={cls.classTeacher || ""}
                                  onChange={(e) => handleClassChange(i, "classTeacher", e.target.value)}
                                  placeholder="শিক্ষকের নাম"
                                  className="w-full border rounded-lg p-2 text-xs bg-white"
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                                  Teacher Name (English)
                                </label>
                                <input
                                  type="text"
                                  value={cls.classTeacherEn || ""}
                                  onChange={(e) => handleClassChange(i, "classTeacherEn", e.target.value)}
                                  placeholder="Teacher's Name"
                                  className="w-full border rounded-lg p-2 text-xs bg-white font-sans"
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                                  যোগাযোগ ফোন নম্বর
                                </label>
                                <input
                                  type="text"
                                  value={cls.teacherPhone || ""}
                                  onChange={(e) => handleClassChange(i, "teacherPhone", e.target.value)}
                                  placeholder="+88017..."
                                  className="w-full border rounded-lg p-2 text-xs bg-white font-mono"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Row 2.5: Section-wise Teachers & Rooms */}
                          <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-xs font-bold text-[#051939] uppercase tracking-wider flex items-center gap-1.5">
                                <FaLayerGroup className="text-blue-600" /> {t("শাখাভিত্তিক শিক্ষক, কক্ষ ও শিক্ষার্থী তথ্য", "Section-wise Teachers, Rooms & Students")}
                              </h4>
                              <button
                                type="button"
                                onClick={() => handleAddSection(i)}
                                className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1 rounded-lg flex items-center gap-1 cursor-pointer shadow-sm transition"
                              >
                                <FaPlus size={10} /> {t("নতুন শাখা যোগ করুন", "Add Section")}
                              </button>
                            </div>

                            {(!cls.sections || cls.sections.length === 0) ? (
                              <p className="text-xs text-gray-400 italic py-2">
                                {t("কোনো শাখা যুক্ত করা নেই। উপরের বাটনে ক্লিক করে শাখা যুক্ত করুন।", "No sections added yet.")}
                              </p>
                            ) : (
                              <div className="space-y-3">
                                {cls.sections.map((sec: any, secIdx: number) => (
                                  <div
                                    key={secIdx}
                                    className="p-3 bg-white rounded-xl border border-gray-200 shadow-sm relative group"
                                  >
                                    <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-100">
                                      <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                                        <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 text-[10px] flex items-center justify-center font-bold">
                                          {secIdx + 1}
                                        </span>
                                        {sec.name || `শাখা ${secIdx + 1}`}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveSection(i, secIdx)}
                                        className="text-red-500 hover:text-red-700 text-xs flex items-center gap-1 hover:bg-red-50 px-2 py-1 rounded transition cursor-pointer"
                                        title="শাখা মুছুন"
                                      >
                                        <FaTrashAlt size={11} />
                                        <span>মুছুন</span>
                                      </button>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-xs">
                                      <div>
                                        <label className="block text-[10px] font-bold text-gray-600 mb-0.5">শাখার নাম (বাংলা)</label>
                                        <input
                                          type="text"
                                          value={sec.name || ""}
                                          onChange={(e) => handleSectionChange(i, secIdx, "name", e.target.value)}
                                          placeholder="ক শাখা"
                                          className="w-full border rounded p-1.5 text-xs bg-gray-50 focus:bg-white"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-[10px] font-bold text-gray-600 mb-0.5">Name (English)</label>
                                        <input
                                          type="text"
                                          value={sec.nameEn || ""}
                                          onChange={(e) => handleSectionChange(i, secIdx, "nameEn", e.target.value)}
                                          placeholder="Section A"
                                          className="w-full border rounded p-1.5 text-xs bg-gray-50 focus:bg-white font-sans"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-[10px] font-bold text-gray-600 mb-0.5">শ্রেণি শিক্ষক (বাংলা)</label>
                                        <input
                                          type="text"
                                          value={sec.classTeacher || ""}
                                          onChange={(e) => handleSectionChange(i, secIdx, "classTeacher", e.target.value)}
                                          placeholder="শিক্ষকের নাম"
                                          className="w-full border rounded p-1.5 text-xs bg-gray-50 focus:bg-white"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-[10px] font-bold text-gray-600 mb-0.5">Teacher (English)</label>
                                        <input
                                          type="text"
                                          value={sec.classTeacherEn || ""}
                                          onChange={(e) => handleSectionChange(i, secIdx, "classTeacherEn", e.target.value)}
                                          placeholder="Teacher Name"
                                          className="w-full border rounded p-1.5 text-xs bg-gray-50 focus:bg-white font-sans"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-[10px] font-bold text-gray-600 mb-0.5">যোগাযোগ ফোন</label>
                                        <input
                                          type="text"
                                          value={sec.teacherPhone || ""}
                                          onChange={(e) => handleSectionChange(i, secIdx, "teacherPhone", e.target.value)}
                                          placeholder="+88017..."
                                          className="w-full border rounded p-1.5 text-xs bg-gray-50 focus:bg-white font-mono"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-[10px] font-bold text-gray-600 mb-0.5">কক্ষ ও শিক্ষার্থী</label>
                                        <div className="grid grid-cols-2 gap-1">
                                          <input
                                            type="text"
                                            value={sec.room || ""}
                                            onChange={(e) => handleSectionChange(i, secIdx, "room", e.target.value)}
                                            placeholder="কক্ষ"
                                            className="w-full border rounded p-1.5 text-xs bg-gray-50 focus:bg-white"
                                          />
                                          <input
                                            type="text"
                                            value={sec.students || ""}
                                            onChange={(e) => handleSectionChange(i, secIdx, "students", e.target.value)}
                                            placeholder="সংখ্যা"
                                            className="w-full border rounded p-1.5 text-xs bg-gray-50 focus:bg-white"
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Row 3: Description & Subjects */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-gray-600 mb-1">
                                শ্রেণির সারসংক্ষেপ ও নির্দেশনা
                              </label>
                              <textarea
                                rows={4}
                                value={cls.description || ""}
                                onChange={(e) => handleClassChange(i, "description", e.target.value)}
                                placeholder="এই শ্রেণির শিক্ষা কার্যক্রম সম্পর্কে বিবরণ..."
                                className="w-full border rounded-lg p-2.5 text-xs bg-gray-50 focus:bg-white leading-relaxed"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-600 mb-1">
                                পাঠ্য বিষয়সমূহ (প্রতি লাইনে একটি করে বিষয় লিখুন)
                              </label>
                              <textarea
                                rows={4}
                                value={Array.isArray(cls.subjects) ? cls.subjects.join("\n") : cls.subjects || ""}
                                onChange={(e) => handleSubjectsChange(i, e.target.value)}
                                placeholder="বাংলা\nEnglish\nগণিত\nবিজ্ঞান..."
                                className="w-full border rounded-lg p-2.5 text-xs bg-gray-50 focus:bg-white font-mono leading-relaxed"
                              />
                            </div>
                          </div>

                          <div className="flex justify-between items-center text-xs text-gray-500 pt-2 border-t">
                            <span className="text-gray-400">
                              ক্লাস পেজ লিঙ্ক: <code className="text-[#051939]">/students/class-{cls.num}</code>
                            </span>
                            <Link
                              href={`/students/class-${cls.num}`}
                              target="_blank"
                              className="text-emerald-700 font-bold hover:underline"
                            >
                              পাবলিক ভিউ দেখুন →
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

            {/* Section 3: Vocational Department */}
            <div className="bg-white rounded-2xl shadow p-6 border-t-4 border-[#965D03]">
              <h3 className="font-bold text-lg text-[#051939] mb-4 flex items-center gap-2">
                <FaLayerGroup className="text-[#965D03]" />
                {t("ভোকেশনাল বিভাগের তথ্য", "Vocational Department Info")}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">বিভাগের নাম (বাংলা)</label>
                  <input type="text" value={vocational.nameBn || ""} onChange={(e) => setVocational({ ...vocational, nameBn: e.target.value })} placeholder="ভোকেশনাল বিভাগ" className="w-full border rounded-lg p-2 text-sm bg-gray-50 focus:bg-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Department Name (English)</label>
                  <input type="text" value={vocational.nameEn || ""} onChange={(e) => setVocational({ ...vocational, nameEn: e.target.value })} placeholder="Vocational Department" className="w-full border rounded-lg p-2 text-sm bg-gray-50 focus:bg-white font-sans" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">কক্ষ নম্বর</label>
                  <input type="text" value={vocational.room || ""} onChange={(e) => setVocational({ ...vocational, room: e.target.value })} placeholder="৩০১" className="w-full border rounded-lg p-2 text-sm bg-gray-50 focus:bg-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">শিক্ষার্থী সংখ্যা (বাংলা)</label>
                  <input type="text" value={vocational.students || ""} onChange={(e) => setVocational({ ...vocational, students: e.target.value })} placeholder="১৫০+" className="w-full border rounded-lg p-2 text-sm bg-gray-50 focus:bg-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">শ্রেণি শিক্ষক (বাংলা)</label>
                  <input type="text" value={vocational.classTeacher || ""} onChange={(e) => setVocational({ ...vocational, classTeacher: e.target.value })} placeholder="শিক্ষকের নাম" className="w-full border rounded-lg p-2 text-sm bg-gray-50 focus:bg-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">শিক্ষকের ফোন</label>
                  <input type="text" value={vocational.teacherPhone || ""} onChange={(e) => setVocational({ ...vocational, teacherPhone: e.target.value })} placeholder="+88017..." className="w-full border rounded-lg p-2 text-sm bg-gray-50 focus:bg-white font-mono" />
                </div>
                <div className="md:col-span-2 lg:col-span-3">
                  <label className="block text-xs font-bold text-gray-600 mb-1">বিভাগের বিবরণ (বাংলা)</label>
                  <textarea rows={2} value={vocational.description || ""} onChange={(e) => setVocational({ ...vocational, description: e.target.value })} className="w-full border rounded-lg p-2 text-sm bg-gray-50 focus:bg-white" placeholder="কারিগরি ও বৃত্তিমূলক শিক্ষায়..." />
                </div>
              </div>
            </div>

            {/* Section 4: Total Classes & Classrooms Summary */}
            <div className="bg-white rounded-2xl shadow p-6 border-t-4 border-purple-500">
              <h3 className="font-bold text-lg text-[#051939] mb-4 flex items-center gap-2">
                <FaBook className="text-purple-500" />
                {t("শ্রেণি ও কক্ষ সংখ্যা (হোমপেজ কার্ড)", "Total Classes & Classrooms (Homepage Card)")}
              </h3>
              <p className="text-xs text-gray-500 mb-4">
                এই তথ্য হোমপেজের &quot;শ্রেণি ও বিভাগ&quot; কার্ডে প্রদর্শিত হবে। সরাসরি Stats Management থেকেও পরিবর্তন করা যাবে।
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">মোট শ্রেণি সংখ্যা</label>
                  <input type="number" value={totalClasses.count || 5} onChange={(e) => setTotalClasses({ ...totalClasses, count: parseInt(e.target.value) || 5 })} className="w-full border rounded-lg p-2 text-sm bg-gray-50 focus:bg-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">মোট শ্রেণিকক্ষ সংখ্যা</label>
                  <input type="number" value={totalClasses.totalRooms || 12} onChange={(e) => setTotalClasses({ ...totalClasses, totalRooms: parseInt(e.target.value) || 12 })} className="w-full border rounded-lg p-2 text-sm bg-gray-50 focus:bg-white" />
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-50 border border-purple-200">
                  <input type="checkbox" id="withVoc" checked={!!totalClasses.withVocational} onChange={(e) => setTotalClasses({ ...totalClasses, withVocational: e.target.checked })} className="w-4 h-4" />
                  <label htmlFor="withVoc" className="text-sm font-bold text-purple-900 cursor-pointer">ভোকেশনাল বিভাগ অন্তর্ভুক্ত</label>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-600 mb-1">বর্ণনা (বাংলা)</label>
                  <input type="text" value={totalClasses.note || ""} onChange={(e) => setTotalClasses({ ...totalClasses, note: e.target.value })} placeholder="৬ষ্ঠ থেকে ১০ম শ্রেণি (৫টি) + ভোকেশনাল বিভাগ" className="w-full border rounded-lg p-2 text-sm bg-gray-50 focus:bg-white" />
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-end gap-4">
                {successMsg && (
                  <span className="text-[#06874A] font-bold text-sm flex items-center gap-2 bg-emerald-50 border border-emerald-300 px-4 py-2 rounded-xl animate-in fade-in">
                    <FaCheckCircle className="text-emerald-600 text-base" /> {t("শ্রেণি ও পরিসংখ্যান সফলভাবে সংরক্ষিত হয়েছে!", "Successfully saved classes & stats!")}
                  </span>
                )}
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-[#06874A] hover:bg-green-700 text-white font-bold px-8 py-3 rounded-xl shadow-md transition disabled:opacity-60 flex items-center gap-2 cursor-pointer"
                >
                  <FaSave />
                  <span>{saving ? t("সংরক্ষণ হচ্ছে...", "Saving...") : t("সকল তথ্য সংরক্ষণ করুন", "Save All Info")}</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
