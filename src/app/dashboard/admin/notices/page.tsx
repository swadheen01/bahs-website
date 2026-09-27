"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaBullhorn, FaPlus, FaTrash, FaEdit, FaArrowLeft, FaFilePdf } from "react-icons/fa";
import FileUpload from "@/components/admin/FileUpload";

interface Notice {
  id: number;
  title: string;
  date: string;
  type: string;
  fileUrl: string | null;
  isNew: boolean;
}

export default function AdminNoticesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [fetching, setFetching] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ title: "", type: "general", fileUrl: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) router.replace("/login");
  }, [user, loading, router]);

  const loadNotices = async () => {
    setFetching(true);
    try {
      const res = await fetch("/api/notices");
      if (res.ok) setNotices(await res.json());
    } catch (e) {
      console.error(e);
    }
    setFetching(false);
  };

  useEffect(() => {
    if (user?.role === "admin") loadNotices();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const dateNow = new Date().toLocaleDateString("bn-BD", { day: "numeric", month: "long", year: "numeric" });
    const payload = { ...form, date: dateNow, dateISO: new Date().toISOString().split("T")[0], isNew: true };

    if (editId !== null) {
      await fetch(`/api/notices/${editId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      setEditId(null);
    } else {
      await fetch("/api/notices", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    }
    setForm({ title: "", type: "general", fileUrl: "" });
    setShowForm(false);
    setSaving(false);
    await loadNotices();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("এই নোটিশটি মুছে ফেলবেন?")) return;
    await fetch(`/api/notices/${id}`, { method: "DELETE" });
    await loadNotices();
  };

  const handleEdit = (n: Notice) => {
    setForm({ title: n.title, type: n.type, fileUrl: n.fileUrl || "" });
    setEditId(n.id);
    setShowForm(true);
  };

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-gray-100 font-bengali">
      <header className="bg-[#051939] text-white px-6 py-4 flex items-center justify-between shadow">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/admin" className="text-gray-300 hover:text-white text-sm flex items-center gap-1">
            <FaArrowLeft /> ড্যাশবোর্ড
          </Link>
          <span className="text-gray-600">|</span>
          <h1 className="text-lg font-bold flex items-center gap-2">
            <FaBullhorn className="text-amber-400" /> নোটিশ বোর্ড ব্যবস্থাপনা
          </h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[#051939]">সকল নোটিশ ({notices.length}টি)</h2>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditId(null);
              setForm({ title: "", type: "general", fileUrl: "" });
            }}
            className="flex items-center gap-2 bg-[#06874A] hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow"
          >
            <FaPlus /> নতুন নোটিশ প্রকাশ করুন
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-8 border-t-4 border-[#06874A]">
            <h3 className="font-bold text-lg text-[#051939] mb-4">
              {editId ? "নোটিশ আপডেট করুন" : "নতুন নোটিশ প্রকাশ"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">নোটিশের শিরোনাম *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                  placeholder="যেমন: অর্ধ-বার্ষিক পরীক্ষার সময়সূচী সংক্রান্ত"
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#051939]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">নোটিশের ধরণ *</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2.5"
                  >
                    <option value="general">সাধারণ (General)</option>
                    <option value="exam">পরীক্ষা (Exam)</option>
                    <option value="admission">ভর্তি (Admission)</option>
                    <option value="urgent">জরুরী (Urgent)</option>
                  </select>
                </div>

                <div className="col-span-full">
                  <FileUpload
                    label="নোটিশের পিডিএফ / ছবি ফাইল আপলোড করুন"
                    value={form.fileUrl}
                    onChange={(url) => setForm({ ...form, fileUrl: url })}
                    accept=".pdf,.doc,.docx,image/*"
                    helpText="নোটিশের পিডিএফ ফাইল বা ছবি সিলেক্ট করুন"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-[#06874A] hover:bg-green-700 text-white font-bold px-6 py-2.5 rounded-lg text-sm disabled:opacity-60"
                >
                  {saving ? "সংরক্ষণ হচ্ছে..." : editId ? "আপডেট করুন" : "প্রকাশ করুন"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-gray-200 text-gray-700 px-6 py-2.5 rounded-lg text-sm"
                >
                  বাতিল
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-xl shadow overflow-hidden">
          {fetching ? (
            <div className="text-center py-10 text-gray-400">লোড হচ্ছে...</div>
          ) : notices.length === 0 ? (
            <div className="text-center py-12 text-gray-400">কোনো নোটিশ পাওয়া যায়নি।</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notices.map((n, i) => (
                <div key={n.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <span className="w-8 h-8 rounded-full bg-blue-50 text-[#051939] font-bold text-xs flex items-center justify-center">
                      {i + 1}
                    </span>
                    <div>
                      <h4 className="font-bold text-gray-800 text-sm">{n.title}</h4>
                      <p className="text-xs text-gray-500 mt-0.5">তারিখ: {n.date} | ধরণ: {n.type}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(n)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <FaEdit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(n.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <FaTrash size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

