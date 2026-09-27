"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useLanguage } from "@/lib/LanguageContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  FaArrowLeft,
  FaPlus,
  FaTrash,
  FaEdit,
  FaCheckCircle,
  FaLandmark,
  FaUsers,
  FaUpload,
  FaPhoneAlt,
} from "react-icons/fa";

export default function AdminCommitteePage() {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();

  const [members, setMembers] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    nameEn: "",
    designation: "",
    designationEn: "",
    category: "অভিভাবক প্রতিনিধি",
    phone: "",
    photo: "",
    term: "২০২৪ - ২০২৬",
    bio: "",
  });

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  const loadMembers = async () => {
    setFetching(true);
    try {
      const res = await fetch("/api/committee");
      const data = await res.json();
      if (data && data.members) {
        setMembers(data.members);
      }
    } catch (err) {
      console.error(err);
    }
    setFetching(false);
  };

  useEffect(() => {
    if (user?.role === "admin") loadMembers();
  }, [user]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({ ...prev, photo: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleOpenAdd = () => {
    setEditId(null);
    setFormData({
      name: "",
      nameEn: "",
      designation: "",
      designationEn: "",
      category: "অভিভাবক প্রতিনিধি",
      phone: "",
      photo: "",
      term: "২০২৪ - ২০২৬",
      bio: "",
    });
    setShowModal(true);
  };

  const handleOpenEdit = (m: any) => {
    setEditId(m.id);
    setFormData({
      name: m.name || "",
      nameEn: m.nameEn || "",
      designation: m.designation || "",
      designationEn: m.designationEn || "",
      category: m.category || "অভিভাবক প্রতিনিধি",
      phone: m.phone || "",
      photo: m.photo || "",
      term: m.term || "২০২৪ - ২০২৬",
      bio: m.bio || "",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.designation) {
      alert("নাম ও পদবী আবশ্যক");
      return;
    }
    setSaving(true);
    try {
      const payload = editId ? { id: editId, ...formData } : formData;
      const res = await fetch("/api/committee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSuccessMsg(editId ? "সদস্যের তথ্য সফলভাবে হালনাগাদ করা হয়েছে!" : "নতুন সদস্য সফলভাবে যুক্ত করা হয়েছে!");
        setShowModal(false);
        loadMembers();
        setTimeout(() => setSuccessMsg(""), 3500);
      } else {
        alert("সংরক্ষণ ব্যর্থ হয়েছে");
      }
    } catch (err) {
      alert("ত্রুটি হয়েছে");
    }
    setSaving(false);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`আপনি কি "${name}"-কে কমিটি তালিকা থেকে মুছে ফেলতে চান?`)) return;
    try {
      const res = await fetch(`/api/committee?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setMembers((prev) => prev.filter((m) => m.id !== id));
      } else {
        alert("মুছে ফেলা সম্ভব হয়নি");
      }
    } catch (err) {
      alert("ত্রুটি হয়েছে");
    }
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
            <FaLandmark className="text-yellow-400" />
            ম্যানেজিং কমিটি (পরিচালনা পর্ষদ) ব্যবস্থাপনা
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/administration/managing-committee"
            target="_blank"
            className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg border border-white/20 transition"
          >
            পাবলিক ভিউ দেখুন →
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl space-y-6">
        {/* Action Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-[#051939]">ম্যানেজিং কমিটির সদস্যবৃন্দ</h2>
            <p className="text-xs text-gray-500 mt-1">
              বিদ্যালয় পরিচালনা পর্ষদের সভাপতি, দাতা, প্রতিষ্ঠাতা, শিক্ষক ও অভিভাবক প্রতিনিধিদের পরিচালনা করুন।
            </p>
          </div>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 bg-[#06874A] hover:bg-green-700 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl shadow transition cursor-pointer"
          >
            <FaPlus size={14} />
            <span>নতুন সদস্য যোগ করুন</span>
          </button>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 flex items-center gap-2 font-bold text-sm shadow-sm animate-in fade-in">
            <FaCheckCircle className="text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Members Grid */}
        {fetching ? (
          <div className="text-center py-16 text-gray-400">লোড হচ্ছে...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {members.map((m) => (
              <div
                key={m.id}
                className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200 flex flex-col justify-between space-y-4 hover:shadow-md transition"
              >
                <div>
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-14 h-16 rounded-xl overflow-hidden bg-gray-200 border border-gray-300 shrink-0">
                      <img
                        src={m.photo || "/images/teachers/default_avatar.png"}
                        alt={m.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full inline-block mb-1">
                        {m.category}
                      </span>
                      <h3 className="font-bold text-sm text-[#051939] truncate">{m.name}</h3>
                      <p className="text-xs text-gray-500 truncate">{m.designation}</p>
                    </div>
                  </div>

                  {m.bio && <p className="text-xs text-gray-600 line-clamp-2">{m.bio}</p>}
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-gray-500 font-mono">{m.term}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(m)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                      title="সম্পাদনা করুন"
                    >
                      <FaEdit size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(m.id, m.name)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition cursor-pointer"
                      title="মুছে ফেলুন"
                    >
                      <FaTrash size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL (ADD / EDIT) */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-base font-bold text-[#051939]">
                {editId ? "সদস্যের তথ্য সম্পাদনা করুন" : "কমিটিতে নতুন সদস্য যুক্ত করুন"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">নাম (বাংলা)</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="সদস্যের নাম"
                    className="w-full border rounded-xl p-2 text-xs bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Name (English)</label>
                  <input
                    type="text"
                    value={formData.nameEn}
                    onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                    placeholder="Member's Name"
                    className="w-full border rounded-xl p-2 text-xs bg-gray-50 font-sans"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">ক্যাটাগরি</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full border rounded-xl p-2 text-xs bg-gray-50"
                  >
                    <option value="সভাপতি">সভাপতি</option>
                    <option value="সদস্য সচিব">সদস্য সচিব</option>
                    <option value="প্রতিষ্ঠাতা সদস্য">প্রতিষ্ঠাতা সদস্য</option>
                    <option value="দাতা সদস্য">দাতা সদস্য</option>
                    <option value="অভিভাবক প্রতিনিধি">অভিভাবক প্রতিনিধি</option>
                    <option value="শিক্ষক প্রতিনিধি">শিক্ষক প্রতিনিধি</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">পদবী</label>
                  <input
                    type="text"
                    required
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    placeholder="e.g. অভিভাবক সদস্য / সভাপতি"
                    className="w-full border rounded-xl p-2 text-xs bg-gray-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">ফোন নম্বর</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+88017..."
                    className="w-full border rounded-xl p-2 text-xs bg-gray-50 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">মেয়াদ / কার্যকাল</label>
                  <input
                    type="text"
                    value={formData.term}
                    onChange={(e) => setFormData({ ...formData, term: e.target.value })}
                    placeholder="২০২৪ - ২০২৬"
                    className="w-full border rounded-xl p-2 text-xs bg-gray-50 font-mono"
                  />
                </div>
              </div>

              {/* Photo Input */}
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 flex items-center gap-3">
                <div className="w-12 h-14 rounded-lg overflow-hidden border bg-gray-200 shrink-0">
                  <img
                    src={formData.photo || "/images/teachers/default_avatar.png"}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <label className="block text-[11px] font-bold text-gray-700">ছবি আপলোড অথবা URL</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="text-[11px] text-gray-600 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-[11px] file:bg-[#051939] file:text-white"
                  />
                  <input
                    type="text"
                    placeholder="বা ছবির URL দিন"
                    value={formData.photo}
                    onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
                    className="w-full border rounded p-1 text-[11px] bg-white font-mono mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">সংক্ষিপ্ত পরিচিতি / মন্তব্য</label>
                <textarea
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="সদস্যের অবদান বা সংক্ষিপ্ত বিবরণ..."
                  className="w-full border rounded-xl p-2 text-xs bg-gray-50"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-[#06874A] hover:bg-green-700 text-white text-xs font-bold px-5 py-2 rounded-xl shadow disabled:opacity-50"
                >
                  {saving ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ করুন"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
