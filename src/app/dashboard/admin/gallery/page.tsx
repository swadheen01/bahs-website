"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaImages, FaPlus, FaTrash, FaEdit, FaArrowLeft, FaTimes, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import FileUpload from "@/components/admin/FileUpload";

interface GalleryItem {
  id: number;
  title: string;
  image: string;
  created_at?: string;
}

const emptyForm = { title: "", image: "" };

export default function AdminGalleryPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [photos, setPhotos] = useState<GalleryItem[]>([]);
  const [fetching, setFetching] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) router.replace("/login");
  }, [user, loading, router]);

  const loadGallery = async () => {
    setFetching(true);
    try {
      const res = await fetch("/api/gallery", { cache: "no-store" });
      const data = await res.json().catch(() => []);
      if (!res.ok) {
        setErrorMsg((data as any)?.error || "গ্যালারি লোড করা যায়নি");
      } else if (Array.isArray(data)) {
        setPhotos(data);
      }
    } catch (e) {
      console.error(e);
      setErrorMsg("সার্ভার থেকে গ্যালারি লোড করা যায়নি");
    }
    setFetching(false);
  };

  useEffect(() => {
    if (user?.role === "admin") loadGallery();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (!form.image && !editId) {
      setErrorMsg("দয়া করে একটি ছবি আপলোড করুন");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        title: form.title?.trim() || "গ্যালারি ছবি",
      };
      const res = editId !== null
        ? await fetch(`/api/gallery/${editId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch("/api/gallery", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
      const resData = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrorMsg(resData.error || (editId !== null ? "ছবি আপডেট করা যায়নি" : "ছবি পোস্ট করা যায়নি"));
        return;
      }

      setSuccessMsg(editId !== null ? "ছবির তথ্য সফলভাবে আপডেট হয়েছে!" : "নতুন ছবি গ্যালারিতে প্রকাশিত হয়েছে!");
      setEditId(null);
      setForm(emptyForm);
      setShowForm(false);
      await loadGallery();
      setTimeout(() => setSuccessMsg(""), 3500);
    } catch {
      setErrorMsg("সার্ভার এরর! ছবি সংরক্ষণ করা যায়নি।");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (p: GalleryItem) => {
    setErrorMsg("");
    setForm({ title: p.title, image: p.image });
    setEditId(p.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: number) => {
    if (!confirm("আপনি কি নিশ্চিতভাবে এই ছবিটি মুছে ফেলতে চান?")) return;
    setErrorMsg("");
    try {
      const res = await fetch(`/api/gallery/${id}`, { method: "DELETE" });
      const resData = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrorMsg(resData.error || "ছবি মুছে ফেলা সম্ভব হয়নি");
        return;
      }
      setSuccessMsg("ছবি গ্যালারি থেকে মুছে ফেলা হয়েছে!");
      await loadGallery();
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch {
      setErrorMsg("মুছে ফেলার সময় ত্রুটি হয়েছে");
    }
  };

  const handleCancel = () => {
    setErrorMsg("");
    setShowForm(false);
    setEditId(null);
    setForm(emptyForm);
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
            <FaImages className="text-pink-400" /> ফটো গ্যালারি ব্যবস্থাপনা
          </h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-[#051939]">গ্যালারির সকল ছবি ({photos.length}টি)</h2>
            <p className="text-xs text-gray-500 mt-0.5">এখানে থাকা ছবিগুলো ওয়েবসাইটের &apos;গ্যালারী&apos; পেজে দেখা যাবে।</p>
          </div>
          <button
            type="button"
            onClick={() => { handleCancel(); setShowForm(!showForm); }}
            className="flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow"
          >
            <FaPlus /> নতুন ছবি পোস্ট করুন
          </button>
        </div>

        {successMsg && (
          <div role="status" className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 flex items-center gap-2 font-bold text-sm shadow-sm">
            <FaCheckCircle className="text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div role="alert" className="mb-6 p-4 rounded-xl bg-red-50 border border-red-300 text-red-800 flex items-center gap-2 font-bold text-sm shadow-sm">
            <FaExclamationTriangle className="text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {showForm && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-8 border-t-4 border-pink-600">
            <h3 className="font-bold text-lg text-[#051939] mb-4">
              {editId ? "ছবির তথ্য আপডেট করুন" : "নতুন ছবি আপলোড করুন"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  ছবির শিরোনাম / ক্যাপশন *
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                  placeholder="যেমন: বিজ্ঞান মেলা ২০২৬-এ শিক্ষার্থীদের প্রজেক্ট প্রদর্শনী"
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-pink-600"
                />
              </div>

              <FileUpload
                label="গ্যালারির ছবি সিলেক্ট বা আপলোড করুন"
                value={form.image}
                onChange={(url) => setForm({ ...form, image: url })}
                required={!editId}
                helpText={editId ? "নতুন ছবি আপলোড করলে পুরনো ছবি বদলে যাবে। ছবি না বদলালে খালি রাখুন।" : "মোবাইল বা পিসি থেকে স্কুলের যেকোনো স্মৃতিময় ছবি আপলোড করুন"}
              />

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-pink-600 hover:bg-pink-700 text-white font-bold px-6 py-2.5 rounded-lg text-sm disabled:opacity-60 shadow"
                >
                  {saving ? "সংরক্ষণ হচ্ছে..." : editId ? "আপডেট করুন" : "ছবি পোস্ট করুন"}
                </button>
                <button type="button" onClick={handleCancel} className="bg-gray-200 text-gray-700 px-6 py-2.5 rounded-lg text-sm flex items-center gap-1.5">
                  <FaTimes size={12} /> বাতিল
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {fetching ? (
            <div className="col-span-full text-center py-12 bg-white rounded-xl shadow text-gray-400">লোড হচ্ছে...</div>
          ) : photos.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-white rounded-xl shadow text-gray-400">কোনো ছবি নেই।</div>
          ) : (
            photos.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col hover:shadow-md transition"
              >
                <div className="relative aspect-[16/10] w-full bg-gray-100">
                  <img
                    src={p.image}
                    alt={p.title}
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/images/gallery/hero-campus.jpg"; }}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <h4 className="font-bold text-gray-800 text-sm leading-snug line-clamp-2 mb-3">{p.title}</h4>

                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
                    <span className="text-[10px] text-gray-400 font-mono truncate max-w-[100px]">
                      {p.image?.startsWith("data:") ? "সংযুক্ত ছবি" : p.image?.split("/").pop()}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleEdit(p)}
                        className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-bold bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded transition"
                        title="এডিট করুন"
                      >
                        <FaEdit size={11} /> এডিট
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(p.id)}
                        className="flex items-center gap-1 text-xs text-red-600 hover:text-red-800 font-bold bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded transition"
                        title="মুছে ফেলুন"
                      >
                        <FaTrash size={11} /> ডিলিট
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
