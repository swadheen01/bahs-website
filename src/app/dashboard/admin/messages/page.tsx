"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useLanguage } from "@/lib/LanguageContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FaArrowLeft,
  FaSave,
  FaCheckCircle,
  FaUserTie,
  FaAward,
  FaHistory,
  FaInfoCircle,
  FaUpload,
} from "react-icons/fa";

export default function AdminMessagesHistoryPage() {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  const [headmaster, setHeadmaster] = useState({
    name: "",
    nameEn: "",
    designation: "",
    designationEn: "",
    message: "",
    messageEn: "",
    photo: "",
  });

  const [president, setPresident] = useState({
    name: "",
    nameEn: "",
    designation: "",
    designationEn: "",
    message: "",
    messageEn: "",
    photo: "",
  });

  const [history, setHistory] = useState({
    bengali: "",
    english: "",
  });

  const [basicInfo, setBasicInfo] = useState({
    totalArea: "",
    established: "",
    phone: "",
    email: "",
    eiin: "",
    schoolCode: "",
  });

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  const loadData = async () => {
    setFetching(true);
    try {
      const res = await fetch("/api/school-info");
      const data = await res.json();
      if (data.headmasterMessage) setHeadmaster(data.headmasterMessage);
      if (data.presidentMessage) setPresident(data.presidentMessage);
      if (data.history) setHistory(data.history);
      setBasicInfo({
        totalArea: data.totalArea || "",
        established: data.established || "",
        phone: data.phone || "",
        email: data.email || "",
        eiin: data.eiin || "",
        schoolCode: data.schoolCode || "",
      });
    } catch (e) {
      console.error(e);
    }
    setFetching(false);
  };

  useEffect(() => {
    if (user?.role === "admin") loadData();
  }, [user]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, target: "headmaster" | "president") => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      if (target === "headmaster") {
        setHeadmaster((prev) => ({ ...prev, photo: base64 }));
      } else {
        setPresident((prev) => ({ ...prev, photo: base64 }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/school-info", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          headmasterMessage: headmaster,
          presidentMessage: president,
          history,
          totalArea: basicInfo.totalArea,
          established: basicInfo.established,
          phone: basicInfo.phone,
          email: basicInfo.email,
          eiin: basicInfo.eiin,
          schoolCode: basicInfo.schoolCode,
        }),
      });

      if (res.ok) {
        setSuccessMsg(true);
        setTimeout(() => setSuccessMsg(false), 3500);
      } else {
        alert("সংরক্ষণ ব্যর্থ হয়েছে");
      }
    } catch (err) {
      alert("ত্রুটি দেখা দিয়েছে");
    }
    setSaving(false);
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
            <FaAward className="text-yellow-400" />
            বক্তব্য ও প্রতিষ্ঠানের ইতিহাস এডিটর
          </h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-[#051939]">
              প্রধান শিক্ষক ও সভাপতির বাণী এবং ইতিহাস ব্যবস্থাপনা
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              ওয়েবসাইটের হোমপেজ এবং 'প্রতিষ্ঠান পরিচিতি' পেজের সকল বক্তব্য ও ইতিহাস সরাসরি এখান থেকে আপডেট করুন।
            </p>
          </div>

          <div className="flex items-center gap-3">
            {successMsg && (
              <span className="text-[#06874A] font-bold text-xs flex items-center gap-1.5 bg-emerald-50 border border-emerald-300 px-3 py-1.5 rounded-lg animate-in fade-in">
                <FaCheckCircle className="text-emerald-600" /> সংরক্ষিত হয়েছে!
              </span>
            )}
            <button
              onClick={handleSubmit}
              disabled={saving || fetching}
              className="flex items-center gap-2 bg-[#06874A] hover:bg-green-700 text-white font-bold px-6 py-2.5 rounded-xl shadow-md transition disabled:opacity-60 cursor-pointer"
            >
              <FaSave />
              <span>{saving ? "সংরক্ষণ হচ্ছে..." : "সকল পরিবর্তন সংরক্ষণ করুন"}</span>
            </button>
          </div>
        </div>

        {/* Prominent Floating Toast Alert (Visible anywhere on screen) */}
        {successMsg && (
          <div className="fixed top-6 right-6 z-[9999] bg-[#06874A] text-white px-5 py-3.5 rounded-2xl shadow-2xl border-2 border-emerald-300 flex items-center gap-3 animate-in slide-in-from-top duration-300">
            <FaCheckCircle className="text-yellow-300 text-2xl shrink-0" />
            <div>
              <p className="text-sm font-bold">সফলভাবে সংরক্ষিত হয়েছে!</p>
              <p className="text-xs text-green-100 font-normal">বক্তব্য ও প্রতিষ্ঠানের সকল তথ্য ডাটাবেজে আপডেট করা হয়েছে।</p>
            </div>
          </div>
        )}

        {/* Inline Banner */}
        {successMsg && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 flex items-center gap-2 font-bold text-sm shadow-sm animate-in fade-in">
            <FaCheckCircle className="text-emerald-600 text-base" />
            <span>বক্তব্য ও ইতিহাসের তথ্য সফলভাবে হালনাগাদ করা হয়েছে!</span>
          </div>
        )}

        {fetching ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow text-gray-400">লোড হচ্ছে...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Section 1: Headmaster Message */}
            <div className="bg-white rounded-2xl shadow p-6 border-t-4 border-[#06874A]">
              <div className="flex items-center justify-between border-b pb-3 mb-5">
                <h3 className="font-bold text-lg text-[#051939] flex items-center gap-2">
                  <FaUserTie className="text-[#06874A]" />
                  প্রধান শিক্ষকের বাণী (Headmaster's Message)
                </h3>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                  হোমপেজ ও পরিচিতি পেজ
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">প্রধান শিক্ষকের নাম (বাংলা)</label>
                  <input
                    type="text"
                    value={headmaster.name}
                    onChange={(e) => setHeadmaster({ ...headmaster, name: e.target.value })}
                    className="w-full border rounded-xl p-2.5 text-sm bg-gray-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Name (English)</label>
                  <input
                    type="text"
                    value={headmaster.nameEn}
                    onChange={(e) => setHeadmaster({ ...headmaster, nameEn: e.target.value })}
                    className="w-full border rounded-xl p-2.5 text-sm bg-gray-50 focus:bg-white font-sans"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">পদবী (বাংলা)</label>
                  <input
                    type="text"
                    value={headmaster.designation}
                    onChange={(e) => setHeadmaster({ ...headmaster, designation: e.target.value })}
                    className="w-full border rounded-xl p-2.5 text-sm bg-gray-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Designation (English)</label>
                  <input
                    type="text"
                    value={headmaster.designationEn}
                    onChange={(e) => setHeadmaster({ ...headmaster, designationEn: e.target.value })}
                    className="w-full border rounded-xl p-2.5 text-sm bg-gray-50 focus:bg-white font-sans"
                  />
                </div>
              </div>

              {/* Photo Input and Preview */}
              <div className="mb-5 p-4 rounded-xl bg-gray-50 border border-gray-200 flex flex-col sm:flex-row items-center gap-5">
                <div className="w-20 h-24 rounded-lg overflow-hidden border-2 border-emerald-500 bg-gray-200 shrink-0">
                  <img
                    src={headmaster.photo || "/images/teachers/headmaster.jpg"}
                    alt="Headmaster"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 w-full space-y-2">
                  <label className="block text-xs font-bold text-gray-700">ছবি পরিবর্তন (ফাইল আপলোড অথবা লিঙ্ক)</label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handlePhotoUpload(e, "headmaster")}
                      className="text-xs text-gray-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-100 file:text-emerald-800 hover:file:bg-emerald-200"
                    />
                    <input
                      type="text"
                      placeholder="বা ছবির URL দিন (/images/...)"
                      value={headmaster.photo}
                      onChange={(e) => setHeadmaster({ ...headmaster, photo: e.target.value })}
                      className="flex-1 border rounded-lg px-2.5 py-1 text-xs bg-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Messages Textarea */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">বক্তব্য / বাণী (বাংলা)</label>
                  <textarea
                    rows={6}
                    value={headmaster.message}
                    onChange={(e) => setHeadmaster({ ...headmaster, message: e.target.value })}
                    className="w-full border rounded-xl p-3 text-sm bg-gray-50 focus:bg-white leading-relaxed"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Message (English)</label>
                  <textarea
                    rows={6}
                    value={headmaster.messageEn}
                    onChange={(e) => setHeadmaster({ ...headmaster, messageEn: e.target.value })}
                    className="w-full border rounded-xl p-3 text-sm bg-gray-50 focus:bg-white leading-relaxed font-sans"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: President Message */}
            <div className="bg-white rounded-2xl shadow p-6 border-t-4 border-[#A53146]">
              <div className="flex items-center justify-between border-b pb-3 mb-5">
                <h3 className="font-bold text-lg text-[#051939] flex items-center gap-2">
                  <FaAward className="text-[#A53146]" />
                  সভাপতির বাণী (President's Message)
                </h3>
                <span className="text-xs font-bold text-rose-700 bg-rose-100 px-3 py-1 rounded-full">
                  ম্যানেজিং কমিটি
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">সভাপতির নাম (বাংলা)</label>
                  <input
                    type="text"
                    value={president.name}
                    onChange={(e) => setPresident({ ...president, name: e.target.value })}
                    className="w-full border rounded-xl p-2.5 text-sm bg-gray-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Name (English)</label>
                  <input
                    type="text"
                    value={president.nameEn}
                    onChange={(e) => setPresident({ ...president, nameEn: e.target.value })}
                    className="w-full border rounded-xl p-2.5 text-sm bg-gray-50 focus:bg-white font-sans"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">পদবী (বাংলা)</label>
                  <input
                    type="text"
                    value={president.designation}
                    onChange={(e) => setPresident({ ...president, designation: e.target.value })}
                    className="w-full border rounded-xl p-2.5 text-sm bg-gray-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Designation (English)</label>
                  <input
                    type="text"
                    value={president.designationEn}
                    onChange={(e) => setPresident({ ...president, designationEn: e.target.value })}
                    className="w-full border rounded-xl p-2.5 text-sm bg-gray-50 focus:bg-white font-sans"
                  />
                </div>
              </div>

              {/* President Photo Input */}
              <div className="mb-5 p-4 rounded-xl bg-gray-50 border border-gray-200 flex flex-col sm:flex-row items-center gap-5">
                <div className="w-20 h-24 rounded-lg overflow-hidden border-2 border-rose-500 bg-gray-200 shrink-0">
                  <img
                    src={president.photo || "/images/president/president.jpg"}
                    alt="President"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 w-full space-y-2">
                  <label className="block text-xs font-bold text-gray-700">ছবি পরিবর্তন (ফাইল আপলোড অথবা লিঙ্ক)</label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handlePhotoUpload(e, "president")}
                      className="text-xs text-gray-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-rose-100 file:text-rose-800 hover:file:bg-rose-200"
                    />
                    <input
                      type="text"
                      placeholder="বা ছবির URL দিন (/images/...)"
                      value={president.photo}
                      onChange={(e) => setPresident({ ...president, photo: e.target.value })}
                      className="flex-1 border rounded-lg px-2.5 py-1 text-xs bg-white font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Messages Textarea */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">বক্তব্য / বাণী (বাংলা)</label>
                  <textarea
                    rows={6}
                    value={president.message}
                    onChange={(e) => setPresident({ ...president, message: e.target.value })}
                    className="w-full border rounded-xl p-3 text-sm bg-gray-50 focus:bg-white leading-relaxed"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Message (English)</label>
                  <textarea
                    rows={6}
                    value={president.messageEn}
                    onChange={(e) => setPresident({ ...president, messageEn: e.target.value })}
                    className="w-full border rounded-xl p-3 text-sm bg-gray-50 focus:bg-white leading-relaxed font-sans"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: School History Editor */}
            <div className="bg-white rounded-2xl shadow p-6 border-t-4 border-[#051939]">
              <div className="flex items-center justify-between border-b pb-3 mb-5">
                <h3 className="font-bold text-lg text-[#051939] flex items-center gap-2">
                  <FaHistory className="text-[#051939]" />
                  প্রতিষ্ঠানের ইতিহাস এডিটর (School History)
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">প্রতিষ্ঠানের ইতিহাস (বাংলা)</label>
                  <textarea
                    rows={8}
                    value={history.bengali}
                    onChange={(e) => setHistory({ ...history, bengali: e.target.value })}
                    className="w-full border rounded-xl p-3 text-sm bg-gray-50 focus:bg-white leading-relaxed"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">School History (English)</label>
                  <textarea
                    rows={8}
                    value={history.english}
                    onChange={(e) => setHistory({ ...history, english: e.target.value })}
                    className="w-full border rounded-xl p-3 text-sm bg-gray-50 focus:bg-white leading-relaxed font-sans"
                  />
                </div>
              </div>

              {/* Basic Facts Matrix */}
              <h4 className="font-bold text-sm text-gray-700 mb-3 flex items-center gap-1.5">
                <FaInfoCircle className="text-blue-600" />
                মূল প্রাতিষ্ঠানিক তথ্যসমূহ
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">মোট ভূমির পরিমাণ</label>
                  <input
                    type="text"
                    value={basicInfo.totalArea}
                    onChange={(e) => setBasicInfo({ ...basicInfo, totalArea: e.target.value })}
                    className="w-full border rounded-lg p-2 text-xs bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">প্রতিষ্ঠার তারিখ</label>
                  <input
                    type="text"
                    value={basicInfo.established}
                    onChange={(e) => setBasicInfo({ ...basicInfo, established: e.target.value })}
                    className="w-full border rounded-lg p-2 text-xs bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">ফোন নম্বর</label>
                  <input
                    type="text"
                    value={basicInfo.phone}
                    onChange={(e) => setBasicInfo({ ...basicInfo, phone: e.target.value })}
                    className="w-full border rounded-lg p-2 text-xs bg-gray-50 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">ইমেইল</label>
                  <input
                    type="text"
                    value={basicInfo.email}
                    onChange={(e) => setBasicInfo({ ...basicInfo, email: e.target.value })}
                    className="w-full border rounded-lg p-2 text-xs bg-gray-50 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">EIIN নম্বর</label>
                  <input
                    type="text"
                    value={basicInfo.eiin}
                    onChange={(e) => setBasicInfo({ ...basicInfo, eiin: e.target.value })}
                    className="w-full border rounded-lg p-2 text-xs bg-gray-50 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 mb-1">বিদ্যালয় কোড</label>
                  <input
                    type="text"
                    value={basicInfo.schoolCode}
                    onChange={(e) => setBasicInfo({ ...basicInfo, schoolCode: e.target.value })}
                    className="w-full border rounded-lg p-2 text-xs bg-gray-50 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Save Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-6 border-t border-gray-200 mt-6">
              {successMsg && (
                <span className="text-[#06874A] font-bold text-sm flex items-center gap-2 bg-emerald-50 border border-emerald-300 px-4 py-2 rounded-xl animate-in fade-in">
                  <FaCheckCircle className="text-emerald-600 text-base" /> বক্তব্য ও ইতিহাস সফলভাবে সংরক্ষিত হয়েছে!
                </span>
              )}
              <button
                type="submit"
                disabled={saving}
                className="bg-[#06874A] hover:bg-green-700 text-white font-bold px-8 py-3 rounded-xl shadow-lg transition disabled:opacity-60 flex items-center gap-2 cursor-pointer"
              >
                <FaSave />
                <span>{saving ? "সংরক্ষণ হচ্ছে..." : "সকল পরিবর্তন সংরক্ষণ করুন"}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
