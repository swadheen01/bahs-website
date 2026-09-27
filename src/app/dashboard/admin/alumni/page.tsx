"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaTrophy, FaSignOutAlt, FaPlus, FaTrash, FaEdit } from "react-icons/fa";
import FileUpload from "@/components/admin/FileUpload";

interface Alumni {
  id: number;
  nameBengali: string;
  nameEnglish: string;
  institution: string;
  degree: string;
  photo: string;
  year: string | null;
}

export default function AdminAlumniPage() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [alumni, setAlumni] = useState<Alumni[]>([]);
  const [fetching, setFetching] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ nameBengali: "", nameEnglish: "", institution: "", degree: "", year: "", photo: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) router.replace("/login");
  }, [user, loading, router]);

  const loadAlumni = async () => {
    setFetching(true);
    const res = await fetch("/api/alumni");
    setAlumni(await res.json());
    setFetching(false);
  };

  useEffect(() => { if (user?.role === "admin") loadAlumni(); }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    if (editId !== null) {
      await fetch(`/api/alumni/${editId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      setEditId(null);
    } else {
      await fetch("/api/alumni", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    }
    setForm({ nameBengali: "", nameEnglish: "", institution: "", degree: "", year: "", photo: "" });
    setShowForm(false);
    setSaving(false);
    await loadAlumni();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("এই কৃতি শিক্ষার্থীকে তালিকা থেকে সরাবেন?")) return;
    await fetch(`/api/alumni/${id}`, { method: "DELETE" });
    await loadAlumni();
  };

  const handleEdit = (a: Alumni) => {
    setForm({ nameBengali: a.nameBengali, nameEnglish: a.nameEnglish, institution: a.institution, degree: a.degree, year: a.year || "", photo: a.photo || "" });
    setEditId(a.id);
    setShowForm(true);
  };

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-[#051939] text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/admin" className="text-gray-400 hover:text-white text-sm font-bengali">← ড্যাশবোর্ড</Link>
          <span className="text-gray-600">|</span>
          <h1 className="text-lg font-bold font-bengali flex items-center gap-2"><FaTrophy className="text-yellow-300" /> কৃতি শিক্ষার্থী ব্যবস্থাপনা</h1>
        </div>
        <button onClick={() => { logout(); router.push("/"); }} className="flex items-center gap-2 bg-[#800505] px-3 py-1.5 rounded text-sm font-bengali hover:bg-red-700">
          <FaSignOutAlt /> লগআউট
        </button>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-[#051939] font-bengali">কৃতি শিক্ষার্থী তালিকা ({alumni.length}জন)</h2>
          <button onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ nameBengali: "", nameEnglish: "", institution: "", degree: "", year: "", photo: "" }); }}
            className="flex items-center gap-2 bg-[#965D03] text-white px-4 py-2 rounded-lg text-sm font-bengali hover:bg-yellow-700 transition-colors">
            <FaPlus /> নতুন যোগ করুন
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-xl shadow p-5 mb-5 border-t-4 border-[#965D03]">
            <h3 className="font-bold text-[#051939] font-bengali mb-4">{editId ? "তথ্য আপডেট করুন" : "নতুন কৃতি শিক্ষার্থী যোগ করুন"}</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: "নাম (বাংলায়) *", key: "nameBengali", required: true },
                { label: "Name (English)", key: "nameEnglish", required: false },
                { label: "প্রতিষ্ঠানের নাম *", key: "institution", required: true },
                { label: "ডিগ্রি/শ্রেণী *", key: "degree", required: true },
                { label: "পাসের বছর", key: "year", required: false },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-sm font-bengali font-medium text-gray-700 mb-1">{f.label}</label>
                  <input type="text" value={form[f.key as keyof typeof form]}
                    onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                    required={f.required}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 font-bengali focus:outline-none focus:ring-2 focus:ring-[#051939]" />
                </div>
              ))}
              <div className="col-span-full">
                <FileUpload
                  label="কৃতি শিক্ষার্থীর ছবি আপলোড করুন"
                  value={form.photo}
                  onChange={(url) => setForm({ ...form, photo: url })}
                  helpText="শিক্ষার্থীর ছবি নির্বাচন করুন"
                />
              </div>
              <div className="md:col-span-2 flex gap-3 pt-2">
                <button type="submit" disabled={saving}
                  className="bg-[#965D03] text-white px-6 py-2.5 rounded-lg font-bengali text-sm hover:bg-yellow-700 disabled:opacity-60">
                  {saving ? "সংরক্ষণ হচ্ছে..." : editId ? "আপডেট করুন" : "যোগ করুন"}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setEditId(null); }}
                  className="bg-gray-200 text-gray-700 px-6 py-2.5 rounded-lg font-bengali text-sm">বাতিল</button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-xl shadow overflow-hidden">
          {fetching ? <div className="text-center py-10 text-gray-400 font-bengali">লোড হচ্ছে...</div> :
            alumni.length === 0 ? (
              <div className="text-center py-12 text-gray-400 font-bengali">
                <FaTrophy size={40} className="mx-auto mb-3 text-gray-300" />
                <p>এখনো কোনো কৃতি শিক্ষার্থী যোগ করা হয়নি।</p>
                <p className="text-sm mt-1">উপরের বোতামে ক্লিক করে যোগ করুন।</p>
              </div>
            ) : (
              <table className="w-full text-sm font-bengali">
                <thead>
                  <tr className="bg-[#051939] text-white">
                    <th className="px-4 py-3 text-left">#</th>
                    <th className="px-4 py-3 text-left">নাম</th>
                    <th className="px-4 py-3 text-left">প্রতিষ্ঠান</th>
                    <th className="px-4 py-3 text-left">ডিগ্রি</th>
                    <th className="px-4 py-3 text-center">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody>
                  {alumni.map((a, i) => (
                    <tr key={a.id} className={`border-b border-gray-100 hover:bg-gray-50 ${i % 2 ? "bg-gray-50/50" : ""}`}>
                      <td className="px-4 py-3 text-gray-500">{i + 1}</td>
                      <td className="px-4 py-3 font-medium">{a.nameBengali}<p className="text-xs text-gray-400">{a.nameEnglish}</p></td>
                      <td className="px-4 py-3 text-gray-600">{a.institution}</td>
                      <td className="px-4 py-3 text-gray-600">{a.degree}</td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => { handleEdit(a); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="text-blue-600 hover:text-blue-800 p-1.5 rounded hover:bg-blue-50">
                            <FaEdit size={14} />
                          </button>
                          <button onClick={() => handleDelete(a.id)} className="text-red-600 hover:text-red-800 p-1.5 rounded hover:bg-red-50">
                            <FaTrash size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
        </div>
      </div>
    </div>
  );
}

